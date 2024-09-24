import { Input, Table, message } from "antd";
import ImportFile from "./components/FileUpload";
import { useRef, useState } from "react";
import axios from "axios";

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

  // useEffect(() => {
  //   setTableData((prev) => {
  //     return prev.map((p) => {
  //       return { ...p, apiKey: apiKey };
  //     });
  //   });
  // }, [apiKey]);

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

  const inputRef = useRef(null);

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
      <Table dataSource={tableData} columns={columns} />
    </>
  );
}

export default App;
