import React, { useState } from 'react';
import Modal from './Modal';

const Notification = ({ message, onConfirm }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleConfirm = () => {
    setIsModalOpen(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="notification-modal">
          <h2 className="text-xl font-bold mb-4">Thông Báo</h2>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end">
            <button 
              onClick={handleConfirm}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Xác Nhận
            </button>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Huỷ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notification;
