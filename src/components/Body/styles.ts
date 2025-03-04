"use client";

import styled from "styled-components";

export const Wrapper = styled.div`
    --gutter: 1.6rem;
    width: 100%;
    padding-inline: var(--gutter);
    min-height: 6rem;
    display: flex;
    flex-direction: column;
    margin-inline: auto;
    height: 100%;
    max-height: calc(100vh - 7.2rem);
`;