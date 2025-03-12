import { FaPlus, FaTimes } from "react-icons/fa";
import * as S from "./styles";

type Tab = { id: number; title: string };

interface TabsProps {
  tabs: Tab[];
  activeTabId: number;
  onAddTab: () => void;
  onRemoveTab: (tabId: number, e: React.MouseEvent<SVGElement>) => void;
  children: React.ReactNode;
}

export const Tabs = ({ tabs, activeTabId, onAddTab, onRemoveTab, children }: TabsProps) => {
  return (
    <S.TabsContainer>
      <div className="nav nav-tabs bg-dark pt-1 px-1" style={{ borderBottom: "1px solid #484c51a3" }}>
        {tabs.map((tab) => (
          <S.Tab
            key={tab.id}
            href={`/dashboard/operacao?tab=${tab.id}`}
            className={`nav-link px-2 py-1 ${activeTabId === tab.id ? "active" : ""}`}
          >
            {tab.title}
            {tab.id !== 1 && (
              <FaTimes
                className="ml-2 text-danger"
                style={{ cursor: "pointer", verticalAlign: "middle" }}
                onClick={(e) => onRemoveTab(tab.id, e)}
              />
            )}
          </S.Tab>
        ))}
        <S.Tab
          href="#"
          className="nav-link px-2 py-1"
          onClick={(e: { preventDefault: () => void; }) => {
            e.preventDefault();
            onAddTab();
          }}
        >
          <FaPlus className="text-light" style={{ verticalAlign: "middle" }} />
        </S.Tab>
      </div>
      <div className="tab-content">{children}</div>
    </S.TabsContainer>
  );
};