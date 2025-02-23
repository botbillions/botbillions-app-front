"use client";

import Link from 'next/link';
import styled, { css } from 'styled-components';

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  color: ${({ theme }) => theme.colors.gray[900]}!important;
  max-width: 28rem;
  padding: 1rem;
  
  & > input {
    margin-bottom: 1.5rem;
  }
`;

export const StyledTitle = styled.h1`

  font-size: ${({ theme }) => theme.font.sizes.xlarge};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({theme}) => theme.colors.gray[200]};
`;


export const StyledLabel = styled.label`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.gray[200]};
`;

export const StyledInput = styled.input`
  padding: 1.2rem;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 0.6rem;
  &:focus{
    border-color:${({ theme }) => theme.colors.secondary[600]};
  }
`;

export const StyledSubmitButton = styled.button`
  padding: 1.2rem;
  background-color: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 0.375rem;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[600]};
  }
`;

export const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary[200]};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-decoration: underline;
`;

export const StyledMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 28rem;
  font-size: ${({ theme }) => theme.font.sizes.small};
`;

export const StyledSuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success[500]};
  border-left: 2px solid ${({ theme }) => theme.colors.success[500]};
  padding-left: 1rem;
`;

export const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error[500]};
  border-left: 2px solid ${({ theme }) => theme.colors.error[500]};
  padding-left: 1rem;
`;

export const StyledInfoMessage = styled.div`
  color: ${({ theme }) => theme.colors.gray[900]};
  border-left: 2px solid ${({ theme }) => theme.colors.gray[300]};
  padding-left: 1rem;
`;

