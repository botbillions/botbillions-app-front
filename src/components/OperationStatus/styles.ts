import styled from 'styled-components';

export const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

export const BotInfo = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  span {
    font-size: 14px;
    font-weight: 500;
  }
`;

export const Controls = styled.div`
  display: flex;
  gap: 12px;
`;

export const StartButton = styled.button`
  display: flex;
  align-items: center;
  background: #10b981;
  color: black;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #059669;
  }
`;

export const StopButton = styled.button`
  display: flex;
  align-items: center;
  background: #ef4444;
  color: black;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 500;
    }

    strong {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
  }
`;

export const OperationsList = styled.div`
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 16px 0;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;

  p {
    margin: 0;
    font-size: 14px;
  }
`;

export const Operations = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

export const OperationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
`;