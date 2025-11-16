import React, { useEffect, useState } from "react";
import axios from "axios";
import { Empty, Popconfirm, message } from "antd";
import { Link } from "react-router-dom";

interface ManagerAccount {
  ID: string;
  Username: string;
  Email: string;
}

interface ManagerAccounts {
  active: ManagerAccount[];
  pending: ManagerAccount[];
  disabled: ManagerAccount[];
}

const OrgsRolesPage: React.FC = () => {
  const [managerAccounts, setManagerAccounts] = useState<ManagerAccounts>({
    active: [],
    pending: [],
    disabled: [],
  });
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchManagerAccounts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8787/admin/manager-accounts",
          { withCredentials: true }
        );
        if (response.data.success) {
          setManagerAccounts({
            active: response.data.data.active,
            pending: response.data.data.pending,
            disabled: response.data.data.disabled,
          });
        }
      } catch (error) {
        console.error("Error fetching manager accounts:", error);
      }
    };

    fetchManagerAccounts();
  }, [managerAccounts]);

  const deactivateAccount = async (accountId: string) => {
    try {
      const response = await axios.post(
        "http://localhost:8787/admin/disable-manager",
        { accountId },
        { withCredentials: true }
      );
      if (response.data.success) {
        messageApi.success("Account disabled successfully");
      }
    } catch (error) {
      messageApi.error("Error disabling account");
    } finally {
      setManagerAccounts(managerAccounts);
    }
  };

  const reactivateAccount = async (accountId: string) => {
    try {
      const response = await axios.post(
        "http://localhost:8787/admin/reactivate-manager",
        { accountId },
        { withCredentials: true }
      );
      if (response.data.success) {
        messageApi.success("Account reactivated successfully");
      }
    } catch (error) {
      messageApi.error("Error reactivating account");
    } finally {
      setManagerAccounts(managerAccounts);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="p-6 flex flex-col gap-y-8">
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <h1 className="text-2xl font-semibold mb-5 text-green-600">
            Active Manager Accounts
          </h1>
          {managerAccounts.active.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {managerAccounts.active.map((account) => (
                <Popconfirm
                  key={account.ID}
                  title="Disable Account"
                  description={`Are you sure to disable this account for ${account.Username}?`}
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => deactivateAccount(account.ID)}
                >
                  <li
                    className="py-3 flex justify-between items-center hover:bg-green-50 transition rounded-md px-2 hover:cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {account.Username}
                      </p>
                      <p className="text-gray-500 text-sm">{account.Email}</p>
                    </div>
                    <span className="text-green-700 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full">
                      Active
                    </span>
                  </li>
                </Popconfirm>
              ))}
            </ul>
          ) : (
            <Empty
              description={
                <p className="text-gray-700 text-base">
                  No active manager accounts found
                </p>
              }
              styles={{ image: { height: 150 } }}
            />
          )}
        </div>
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <h1 className="text-2xl font-semibold mb-5 text-yellow-600">
            Pending Accounts
          </h1>
          {managerAccounts.pending.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {managerAccounts.pending.map((account) => (
                <Link to="/admin/approvals" key={account.ID}>
                  <li className="py-3 flex justify-between items-center hover:bg-yellow-50 transition rounded-md px-2 hover:cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">
                        {account.Username}
                      </p>
                      <p className="text-gray-500 text-sm">{account.Email}</p>
                    </div>
                    <span className="text-yellow-700 font-semibold text-sm bg-yellow-100 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  </li>
                </Link>
              ))}
            </ul>
          ) : (
            <Empty
              description={
                <p className="text-gray-700 text-base">
                  No pending manager accounts found
                </p>
              }
              styles={{ image: { height: 150 } }}
            />
          )}
        </div>
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <h1 className="text-2xl font-semibold mb-5 text-red-600">
            Disabled Accounts
          </h1>
          {managerAccounts.disabled.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {managerAccounts.disabled.map((account) => (
                <Popconfirm
                  key={account.ID}
                  title="Reactivate Account"
                  description={`Are you sure to reactivate this account for ${account.Username}?`}
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => reactivateAccount(account.ID)}
                >
                  <li
                    className="py-3 flex justify-between items-center hover:bg-red-50 transition rounded-md px-2 hover:cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {account.Username}
                      </p>
                      <p className="text-gray-500 text-sm">{account.Email}</p>
                    </div>
                    <span className="text-red-700 font-semibold text-sm bg-red-100 px-3 py-1 rounded-full">
                      Disabled
                    </span>
                  </li>
                </Popconfirm>
              ))}
            </ul>
          ) : (
            <Empty
              description={
                <p className="text-gray-700 text-base">
                  No disabled manager accounts found
                </p>
              }
              styles={{ image: { height: 150 } }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default OrgsRolesPage;
