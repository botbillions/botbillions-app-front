"use client";

import styled from "styled-components";

export const Wrapper = styled.div`
    --gutter: 1.6rem;
    width: 100%;
    padding-inline: var(--gutter);
    display: flex;
    height: 100%;
    flex-direction: column;
    margin-inline: auto;
    max-height: calc(100% - 7.2rem);
`;