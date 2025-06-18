import styled from 'styled-components';

export const OperacaoContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

export const HeaderAccount = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 24px;

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;

    p {
      margin: 0;
      font-size: 14px;
      color: #64748b;
      
      &:first-child {
        font-weight: 600;
        color: #1e293b;
      }
    }
  }
`;

export const OperacaoTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;

  hr {
    flex: 1;
    border: none;
    height: 1px;
    background: #e2e8f0;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #3b82f6;
    border-radius: 50%;
    color: black;
  }
`;

export const BtnContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

export const StatusContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  & p, h1,h2,h3,h4{
    color: #000;
  }
`;

export const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  div {
    h3 {
      color: black;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    span {
      &.active {
        color: #10b981;
      }
      &.inactive {
        color: #6b7280;
      }
    }
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
`;

export const StatCard = styled.div`
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;

  .label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .value {
    font-weight: 600;
    color: black;
    
    &.profit-positive {
      color: #10b981;
    }
    
    &.profit-negative {
      color: #ef4444;
    }
  }
`;

export const OperationsSection = styled.div`
  h4 {
    color: black;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
`;

export const NoOperationsMessage = styled.p`
  color: #6b7280;
  text-align: center;
  padding: 16px 0;
  margin: 0;
`;

export const OperationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 160px;
  overflow-y: auto;
`;

export const OperationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
`;

export const OperationLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .direction {
    &.buy {
      color: #10b981;
    }
    &.sell {
      color: #ef4444;
    }
  }

  .symbol {
    color: black;
    font-size: 14px;
  }

  .status {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;

    &.completed {
      background: #d1fae5;
      color: #065f46;
    }

    &.failed {
      background: #fee2e2;
      color: #991b1b;
    }

    &.pending {
      background: #fef3c7;
      color: #92400e;
    }
  }
`;

export const OperationRight = styled.div`
  text-align: right;

  .amount {
    font-size: 14px;
    color: black;
  }

  .profit {
    font-size: 12px;
    
    &.positive {
      color: #10b981;
    }
    
    &.negative {
      color: #ef4444;
    }
  }
`;

export const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;

  &.primary {
    background: #3b82f6;
    color: white;

    &:hover {
      background: #2563eb;
    }
  }

  &.danger {
    background: #ef4444;
    color: white;

    &:hover {
      background: #dc2626;
    }
  }

  &.secondary {
    background: #6b7280;
    color: white;

    &:hover {
      background: #4b5563;
    }
  }
`;
