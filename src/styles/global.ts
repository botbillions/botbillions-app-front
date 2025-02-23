"use client";

import { createGlobalStyle, css } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 62.5%;
    scroll-behavior: smooth;
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body, input, textarea, button, select {
    ${({ theme }) => css`
      font-family: var(--font-archivo), Arial, sans-serif;
      font-size: ${theme.font.sizes.regular};
      font-weight: ${theme.font.weight.regular};
    `}
  }

  input, textarea, select {
    border: none;
    border-radius: 8px;
    padding: 1rem 1.6rem;
    width: 100%;

    ${({ theme }) => css`
      background-color: ${theme.colors.white};
    `}
  }

  ::placeholder {
    ${({ theme }) => css`
      color: ${theme.colors.gray[400]};
      background-color: ${theme.colors.white};
    `}
  }

  button {
    border: none;
    border-radius: 8px;
    width: fit-content;
    cursor: pointer;
  }

  ul, ol {
    list-style: none;
  }

  a {
    display: inline-block;
    text-decoration: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  @media (max-width: 768px) {
    html {
      font-size: 50%;
    }
  }
`;

export default GlobalStyle;
