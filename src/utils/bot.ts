import { parseStringPromise } from "xml2js";

export async function extractBotParams(xmlContent: string) {
  const parsedXml = await parseStringPromise(xmlContent);
  const prompts: { id: string; text: string }[] = [];
  let welcomeMessage: string | null = null;
  let strategy: { type: string; multiplier: number } | null = null;
  const blocks = parsedXml.xml?.block || [];

  const traverseBlocks = (blockArray: any[]) => {
    if (!Array.isArray(blockArray)) return;

    for (const block of blockArray) {
      // Extrai prompts de variáveis
      if (block.$?.type === "variables_set") {
        const varId = block.field?.find((f: any) => f.$.name === "VAR")?.$.id;
        const promptBlock = block.value?.[0]?.block?.[0];

        if (promptBlock?.$?.type === "text_prompt_ext") {
          const promptText =
            promptBlock.value?.[0]?.shadow?.[0]?.field?.[0]?._ ||
            promptBlock.value?.[0]?.block?.[0]?.field?.[0]?._;
          if (varId && promptText) {
            prompts.push({ id: varId, text: promptText });
          }
        }
      }

      // Extrai mensagem de boas-vindas
      if (!welcomeMessage && block.$?.type === "text_print") {
        const textField =
          block.value?.[0]?.shadow?.[0]?.field?.[0]?._ ||
          block.value?.[0]?.block?.[0]?.field?.[0]?._;
        if (textField) {
          welcomeMessage = textField;
        }
      }

      // Extrai estratégia Martingale
      if (block.$?.type === "after_purchase") {
        console.log('[Martingale] Found after_purchase block');
        const afterPurchaseStack = block.statement?.find(
          (s: any) => s.$.name === "AFTERPURCHASE_STACK"
        );
        console.log('[Martingale] AFTERPURCHASE_STACK exists:', !!afterPurchaseStack);
        if (afterPurchaseStack) {
          const controlsIfBlock = afterPurchaseStack.block?.find(
            (b: any) => b.$.type === "controls_if"
          );
          console.log('[Martingale] controls_if exists:', !!controlsIfBlock);
          if (controlsIfBlock) {
            const elseStatement = controlsIfBlock.statement?.find(
              (s: any) => s.$.name === "ELSE"
            );
            console.log('[Martingale] ELSE statement exists:', !!elseStatement);
            if (elseStatement) {
              // Função para buscar math_change recursivamente em block e next
              const findMathChange = (blocks: any[]): any | undefined => {
                if (!blocks || !Array.isArray(blocks)) return undefined;
                for (const b of blocks) {
                  if (
                    b.$?.type === "math_change" &&
                    b.field?.[0]?._ === "Valor Inicial"
                  ) {
                    return b;
                  }
                  if (b.next?.[0]?.block) {
                    const found = findMathChange(b.next[0].block);
                    if (found) return found;
                  }
                }
                return undefined;
              };

              const mathChangeBlock = findMathChange(elseStatement.block);
              console.log('[Martingale] math_change for Valor Inicial exists:', !!mathChangeBlock);
              if (mathChangeBlock) {
                const mathArithmeticBlock = mathChangeBlock.value?.find(
                  (v: any) => v.block?.[0]?.$?.type === "math_arithmetic" && v.block?.[0]?.field?.[0]?._ === "MULTIPLY"
                );
                console.log('[Martingale] math_arithmetic with MULTIPLY exists:', !!mathArithmeticBlock);
                if (mathArithmeticBlock) {
                  const multiplierBlock = mathArithmeticBlock.block?.[0]?.value?.find(
                    (v: any) => v.$.name === "B"
                  );
                  console.log('[Martingale] multiplier block exists:', !!multiplierBlock);
                  if (multiplierBlock) {
                    let multiplierValue: string | undefined;
                    if (multiplierBlock.block?.[0]?.$?.type === "variables_get") {
                      const varId = multiplierBlock.block[0].field?.[0]?.$.id;
                      console.log('[Martingale] variables_get varId:', varId);
                      // Busca o variables_set correspondente
                      const varSetBlock = blocks.find(
                        (b: any) =>
                          b.$?.type === "variables_set" &&
                          b.field?.[0]?.$.id === varId
                      );
                      console.log('[Martingale] variables_set block exists:', !!varSetBlock);
                      if (varSetBlock) {
                        multiplierValue =
                          varSetBlock.value?.[0]?.block?.[0]?.field?.[0]?._;
                        console.log('[Martingale] variable value:', multiplierValue);
                      }
                    } else {
                      multiplierValue =
                        multiplierBlock.block?.[0]?.field?.[0]?._ ||
                        multiplierBlock.shadow?.[0]?.field?.[0]?._;
                    }
                    console.log('[Martingale] multiplier value:', multiplierValue);
                    const multiplier = parseFloat(multiplierValue || "2");
                    if (!isNaN(multiplier)) {
                      strategy = {
                        type: "martingale",
                        multiplier: multiplier,
                      };
                      console.log('[Martingale] Strategy set:', strategy);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Continua a recursão
      if (block.value) traverseBlocks(block.value.flatMap((v: any) => v.block || []));
      if (block.statement) traverseBlocks(block.statement.flatMap((s: any) => s.block || []));
      if (block.next) traverseBlocks(block.next.flatMap((n: any) => n.block || []));
    }
  };

  traverseBlocks(blocks);

  console.log('[Martingale] Final extracted strategy:', strategy);

  return {
    preview: {
      prompts,
      welcomeMessage,
    },
    tradeOptions: {
      symbol: blocks.find((b: any) => b.$?.type === "trade")?.field?.find((f: any) => f.$.name === "SYMBOL_LIST")?._ || "R_10",
      contractType: blocks.find((b: any) => b.$?.type === "trade")?.field?.find((f: any) => f.$.name === "TYPE_LIST")?._ || "DIGITOVER",
      duration: parseFloat(
        blocks.find((b: any) => b.$?.type === "tradeOptions")?.value?.find((v: any) => v.$.name === "DURATION")?.shadow?.[0]?.field?.[0]?._ || "1"
      ),
      durationUnit: blocks.find((b: any) => b.$?.type === "tradeOptions")?.field?.find((f: any) => f.$.name === "DURATIONTYPE_LIST")?._ || "t",
      currency: blocks.find((b: any) => b.$?.type === "tradeOptions")?.field?.find((f: any) => f.$.name === "CURRENCY_LIST")?._ || "USD",
    },
    strategy,
    xmlContent,
  };
}