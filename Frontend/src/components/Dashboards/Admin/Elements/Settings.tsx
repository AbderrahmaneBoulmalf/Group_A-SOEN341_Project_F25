import React, { useState } from "react";
import DeleteAccount from "../EditAccount/DeleteAccount";
import EditInfo from "../EditAccount/EditInfo";
import UpdatePassword from "../EditAccount/UpdatePassword";

const Settings: React.FC = () => {
  const [error, setError] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const AccountDeletion: React.FC = () => {
    return (
      <div className="shadow-md rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-10 pl-4 w-full">
        <h1 className="mb-2 text-base font-semibold">Close your account</h1>
        <p className="text-sm">
          Closing your account is permanent and cannot be undone. All your data,
          including saved preferences and history, will be deleted. If you're
          sure you want to proceed, please confirm below.
        </p>
        <br />
        <DeleteAccount modal={deleteModal} setModal={setDeleteModal} />
      </div>
    );
  };

  return (
    <div className="ml-4 mb-10 mr-4 mt-2 flex items-center flex-col h-[98%]">
      {error ? (
        <div className="flex h-40 items-center justify-center text-center text-red-400">
          <p>Error fetching data. Please try again later.</p>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center space-y-10 mt-10 mb-10">
          <div className="w-full flex-col flex items-center justify-center shadow-md rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-8 pl-4">
            <EditInfo setError={setError} />
            <UpdatePassword />
          </div>
          <AccountDeletion />
        </div>
      )}
    </div>
  );
};

export default Settings;
