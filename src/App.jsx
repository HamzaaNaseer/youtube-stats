import { Button, Input, Skeleton, Space, Table, message } from "antd";
import ImportFile from "./components/FileUpload";
import { useEffect, useRef, useState } from "react";
import {
  deleteRow,
  deleteTable,
  getStats,
  updateStats,
} from "./appRedux/actions/statsActions";
import { useAppDispatch } from "./appRedux/reducers/store";
import { useSelector } from "react-redux";
import { StatsSelector } from "./appRedux/reducers";

const columns = [
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Password",
    dataIndex: "password",
  },
  {
    title: "Recovery Email",
    dataIndex: "recoveryEmail",
  },
  {
    title: "Recovery Password",
    dataIndex: "recoveryPassword",
  },
  {
    title: "Channel Link",
    dataIndex: "channelLink",
  },
  {
    title: "Airtalbes Token",
    dataIndex: "airtableToken",
  },
  {
    title: "Airtalbes Link",
    dataIndex: "airtableLink",
  },

  {
    title: "Views",
    dataIndex: "views",
  },
  {
    title: "Subscribers",
    dataIndex: "subs",
  },
  {
    title: "Videos",
    dataIndex: "videos",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

function App() {
  const [apiKey, setApiKey] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  const { stats: apiStats, total } = useSelector(StatsSelector);

  const defaultCurrent = 1;
  const defaultPageSize = 6;

  const [pageData, setPageData] = useState({
    current: defaultCurrent,
    pageSize: defaultPageSize,
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchStats();
  }, [pageData]);

  const [pageSize, setPageSize] = useState(2);

  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  /**
   *  Fetch logs
   */
  const fetchStats = async () => {
    setFetchLoading(true);
    await dispatch(
      getStats({
        page: Number(pageData.current),
        limit: Number(pageData.pageSize),
      })
    );
    setFetchLoading(false);
  };

  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteTableLoading, setDeleteTableLoading] = useState(false);

  const prepareStatsData =
    (apiStats &&
      apiStats.map((a, idx) => {
        return {
          ...a,
          action: (
            <Space>
              <Button
                loading={updateLoading}
                onClick={async () => {
                  if (!apiKey) {
                    message.error("select api key");

                    return;
                  }
                  setUpdateLoading(true);
                  dispatch(
                    updateStats({
                      apiKey: inputRef.current.input.value,
                      statsToUpdate: [{ ...a }],
                    })
                  );
                  setUpdateLoading(false);
                }}
              >
                Update
              </Button>
              <Button
                onClick={() => {
                  dispatch(deleteRow(a._id));
                }}
              >
                Delete
              </Button>
            </Space>
          ),
        };
      })) ||
    [];

  return (
    <>
      <Input
        ref={inputRef}
        placeholder="Enter api key"
        style={{ maxWidth: "500px" }}
        value={apiKey}
        onChange={(e) => {
          setApiKey(e.target.value);
        }}
      />

      <ImportFile apiKey={apiKey} />
      <Button
        onClick={async () => {
          setLoading(true);
          await dispatch(
            updateStats({
              apiKey: inputRef.current.input.value,
              statsToUpdate: apiStats,
            })
          );
          setLoading(false);
        }}
        loading={loading}
      >
        Update All
      </Button>

      <Button
        onClick={async () => {
          setDeleteTableLoading(true);
          await dispatch(deleteTable());
          setDeleteTableLoading(false);
        }}
        loading={deleteTableLoading}
      >
        Delete All
      </Button>

      {fetchLoading ? (
        <Skeleton />
      ) : (
        <Table
          dataSource={prepareStatsData}
          columns={columns}
          pagination={{
            current: pageData?.current,
            defaultPageSize: defaultPageSize,
            showSizeChanger: true,
            total: total,
            position: ["bottomCenter"],
            // eslint-disable-next-line no-magic-numbers
            pageSizeOptions: [2, 6, 10, 20, 50],
            pageSize: pageData.pageSize,
          }}
          onChange={setPageData}
        />
      )}
    </>
  );
}

export default App;
