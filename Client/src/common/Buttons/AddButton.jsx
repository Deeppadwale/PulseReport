import { Plus } from 'lucide-react';

const AnimatedButton = ({ onClick, inputRef, disabled, permissionsData, children }) => {
  return (
    <>
      <button
        className="animated-button"
        onClick={onClick}
      >
        <Plus className="icon" />
        {children}
      </button>

     <style>{`
  .animated-button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    width: 80px;
    height: 48px;
    background: linear-gradient(to right, #14b8a6, #059669, #047857);
    color: white;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    text-align: center;
  }

  .animated-button:hover {
    transform: scale(1.05);
    box-shadow: 0px 6px 16px rgba(0, 128, 0, 0.4);
  }

  .animated-button:disabled {
    background: #e5e5e5;
    cursor: not-allowed;
  }

  .animated-button .icon {
    transition: transform 0.3s ease;
    font-size: 24px;
  }

  .animated-button:hover .icon {
    transform: rotate(180deg);
  }

  .animated-button:disabled .icon {
    transform: none;
  }
`}</style>

    </>
  );
};

export default AnimatedButton;
