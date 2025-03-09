"use client";

import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  ${({ theme }) => css`
    background-color: ${theme.colors.primary[900]};
  `}
`;

export const UploadArea = styled.div<{ $isDragging?: boolean }>`
  border: 2px dashed ${({ theme }) => theme.colors.gray[300]};
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
  ${({ $isDragging, theme }) =>
    $isDragging &&
    css`
      border-color: ${theme.colors.primary[500]};
      background-color: ${theme.colors.primary[50]};
    `}
`;

export const UploadLabel = styled.label`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary[500]};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[600]};
  }
`;

export const InputFile = styled.input`
  display: none;
`;

export const InputText = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 4px;
  margin-top: 0.5rem;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
`;

export const Button = styled.button`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.success[500]};
  color: white;
  padding: 0.75rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background-color: ${({ theme }) => theme.colors.success[600]};
  }
`;

export const Message = styled.p<{ $error?: boolean }>`
  margin-top: 1rem;
  font-size: 0.875rem;
  color: ${({ $error, theme }) => ($error ? theme.colors.error[500] : theme.colors.success[500])};
`;