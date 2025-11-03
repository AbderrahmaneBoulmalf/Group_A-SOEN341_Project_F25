import React, { useState } from "react";
import { Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Props {
  modal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteAccount: React.FC<Props> = ({ modal, setModal }) => {
  const [query, setQuery] = useState<String>("");
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const deleteAccount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8787/account/deleteAccount",
        null,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        messageApi.open({
          type: "success",
          content: "Account deleted successfully.",
        });
        // Redirect to homepage after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: any) {
      console.log("Error: " + error.message);
      console.log("Error response: ", error.response);
      messageApi.open({
        type: "error",
        content: "Failed to delete account. Please try again later.",
      });
    }
  };

  return (
    <>
      {contextHolder}
      <button
        onClick={() => setModal(true)}
        className="mt-2 rounded-full border border-red-500 p-1 px-4 text-sm text-red-600 hover:bg-red-500 hover:text-white hover:cursor-pointer"
      >
        Close Account
      </button>
      <Modal
        title={<p className="text-xl">Close your Account?</p>}
        open={modal}
        onCancel={() => setModal(false)}
        onOk={deleteAccount}
        style={{ top: 20 }}
        okButtonProps={{
          disabled: query !== "close",
          style: {
            backgroundColor: "#f5222d",
            color: "white",
          },
        }}
        cancelButtonProps={{
          style: {
            backgroundColor: "transparent",
            color: "#000000  ",
            borderColor: "#9ca3af ",
          },
        }}
      >
        <p>
          Are you sure you want to close your account? All data will be lost
          permanently.
        </p>

        <p className="mt-3">Type 'close' to confirm</p>
        <input
          type="text"
          className="mb-1 mt-2 w-full rounded-md border border-black p-1"
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="mb-1 mt-2 text-red-500">This action is irreversible</p>
      </Modal>
    </>
  );
};

export default DeleteAccount;
