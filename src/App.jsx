import { Button, Input, Table, message } from "antd";
import ImportFile from "./components/FileUpload";
import { useRef, useState } from "react";
import axios from "axios";
import {
  findAllIndexes,
  getChannelIdFromUsername,
  getStatsCount,
  getUserNameFromUrl,
} from "./utils";

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
    dataIndex: "viewCount",
  },
  {
    title: "Subscribers",
    dataIndex: "subscriberCount",
  },
  {
    title: "Videos",
    dataIndex: "videoCount",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

function App() {
  const [tableData, setTableData] = useState([]);
  const [apiKey, setApiKey] = useState("");

  const fetchData = async (url, index) => {
    // here we have to extract the usrename from the channel link

    // Split the string at '@' and then take the part after it
    const usernamePart = url.split("@")[1];

    // Split at '?' if present, otherwise take the full string as username
    const username = usernamePart.split("?")[0];

    let currentKey = inputRef.current.input.value;

    if (!currentKey) {
      message.error("please select api key");
      return;
    }
    try {
      let params = {
        part: "snippet",
        q: username,
        type: "channel",
        key: currentKey,
      };

      let res = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: params,
        }
      );

      let channelId = res.data.items[0]?.id?.channelId;

      // now that we got channel id we will query for the statistics

      let statisticsData = await axios.get(
        `https://www.googleapis.com/youtube/v3/channels`,
        {
          params: {
            part: "statistics", // this will query us the stats of the channel
            id: channelId,
            key: currentKey,
          },
        }
      );

      let stats = statisticsData.data?.items[0]?.statistics;

      setTableData((prev) => {
        return prev.map((p, idx) => {
          if (idx === index) {
            return {
              ...p,
              viewCount: stats?.viewCount,
              videoCount: stats?.videoCount,
              subscriberCount: stats?.subscriberCount,
            };
          }
          return p;
        });
      });

      return {
        viewCount: stats?.viewCount,
        videoCount: stats?.videoCount,
        subscriberCount: stats?.subscriberCount,
      };
    } catch (error) {
      console.log("error is ", error);
      return false;
    }
  };

  const [pageSize, setPageSize] = useState(2);

  const [loading, setLoading] = useState(false);

  const updateAll = async () => {
    setLoading(true);
    let currentKey = inputRef.current.input.value;

    if (!currentKey) {
      message.error("please select api key");
      setLoading(false);
      return;
    }

    let startIndex = (page - 1) * pageSize;
    let endIndex = Math.min(page * pageSize - 1, tableData.length - 1);
    try {
      const usernames = tableData.slice(startIndex, endIndex + 1).map((d) => {
        console.log("d is ", d.channelLink);
        return getUserNameFromUrl(d.channelLink);
      });

      const channelIds = await getChannelIdFromUsername(usernames, currentKey);

      console.log("channel ids are ", channelIds);

      const stats = await getStatsCount(channelIds, currentKey);
      console.log("stats are ", stats);

      // updating all the undefined ids
      const channelsNotFound = findAllIndexes(channelIds, "NONE");

      channelsNotFound?.forEach((idx) => {
        setTableData((prev) => {
          const newData = [...prev];

          newData[idx] = {
            ...prev[idx],
            viewCount: "?",
            videoCount: "?",
            subscriberCount: "?",
          };
          return newData;
        });
      });

      stats.forEach((stat) => {
        const index = channelIds.indexOf(stat.id);
        if (index !== -1) {
          const stats = stat.statistics;
          const updatedItem = {
            ...tableData[index],
            viewCount: stats?.viewCount,
            videoCount: stats?.videoCount,
            subscriberCount: stats?.subscriberCount,
          };

          setTableData((prev) => {
            const newData = [...prev];
            newData[index] = updatedItem;

            return newData;
          });
        }
      });
    } catch (error) {
      message.error("some error occurred");
    }

    setLoading(false);
  };

  const inputRef = useRef(null);
  const [page, setPage] = useState(1);

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

      <ImportFile
        setData={setTableData}
        fetchData={fetchData}
        apiKey={apiKey}
      />
      <Button onClick={updateAll} loading={loading}>
        Update All
      </Button>
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: [2, 5, 10, 20, 50, 100],
        }}
        onChange={(pagination) => {
          console.log("pagination is ", pagination);
          setPage(pagination.current);
          setPageSize(pagination.pageSize);
        }}
      />
    </>
  );
}

export default App;
