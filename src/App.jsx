import React, { useEffect, useRef, useState } from 'react'
import "./App.css"
import { ZIM } from 'zego-zim-web';
import { app_ID } from './helper';

const App = () => {
  const [zimInstance, setZimInstance] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState("rohan");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const appID = app_ID;

  const token_rohan = "04AAAAAGiRx/4ADIuMzvKtNvHdObKUmACwafHHDOXUxrLp09GEW+Zo1ouT4CTJkAm8sa51APdkYFrvG4n8V/U7xcB0rGd8LkMr8qf0m1IlMmUSPrMntNYokXMeINkHZFHTtlrJC79XYDsjIDlSBN+E0AIqD/zT0jhlCIaNUCUd4bL7K3D1iWMVUWNON1Er4hz19WA5ARTBFXZ5NhVsJvRgc15E4ioDTteva7NURUh3pFy0Z8OziW6kJkR2InbpDMWI7ddxEHACNAcB";
  const token_aman = "04AAAAAGiRyBQADO15ZI2aGBrDlxW3zQCvVKGp9L2rlG3XRfsmydGrw8m+uxo22jy7kELzw7YrG2s5H6QxI+nwB+D6IVRHynowyk6aBZcqjoMdBr6l9jaSERDJdFSM53QVd6rPlMjdiooVPH5ddaYhUzbAavsaXfajoUHkBowm97PYFyYYKNuyRMxBumytPiJwHs9RaekbaWeNLLTchbbvfWZPEK8RyQe7//Lk9LWe42AINt0sxQ2bSsUD1OrrxyW244fHsXo7bAE=";

  const messageEndRef = useRef(null);

  useEffect(() => {
      const instance = ZIM.create(appID);
      setZimInstance(instance);
  
      // Set up and listen for the callback for receiving error codes. 
      instance.on('error', function (zim, errorInfo) {
        console.log('error', errorInfo.code, errorInfo.message);
      });
  
      // Set up and listen for the callback for connection status changes.
      instance.on('connectionStateChanged', function (zim, { state, event }) {
        console.log('connectionStateChanged', state, event);
      });
  
      // Set up and listen for the callback for receiving one-to-one messages. 
      instance.on('peerMessageReceived', function (zim, { messageList }) {
        setMessages(prev => [...prev, ...messageList]);
        console.log('peerMessageReceived', messageList);
      });
  
      // Set up and listen for the callback for token expires.
      instance.on('tokenWillExpire', function (zim, { second }) {
        console.log('tokenWillExpire', second);
        // You can call the renewToken method to renew the token. 
        // To generate a new Token, refer to the Prerequisites.
        zim.renewToken(selectedUser === "rohan" ? token_rohan : token_aman)
          .then(function () {
            console.log("token renewd successfully")
            // Renewed successfully.
          })
          .catch(function (err) {
            console.log("An Error Occured: ", err);
            // Renew failed.
          })
      });
  
      return () => {
        instance.destroy();
      };
  
    }, []);
  

  const login = () => {
    const info = { userID: selectedUser, username: selectedUser === "rohan" ? "Rohan" : "Aman" };
    setUserInfo(info);
    var login_token = selectedUser === "rohan" ? token_rohan : token_aman;

    if (zimInstance) {

      zimInstance.login(info, login_token)
        .then(function () {
          console.log("login successfully")
          setIsLoggedIn(true);
        })
        .catch(function (err) {
          console.log("An Error Occured: ", err);
        })

    }
    else {
      console.log("ZimInstance not initialized");
    }
  };

  const sendMessage = () => {
    if (!isLoggedIn) return;

    if (zimInstance) {
      const toConversationID = selectedUser === "rohan" ? "aman" : "rohan"; // Peer user's ID.
      const conversationType = 0; // Message type; One-to-one chat: 0, in-room chat: 1, group chat:2 
      const config = {
        priority: 1, // Set priority for the message. 1: Low (by default). 2: Medium. 3: High.
      };

      const messageTextObj = { type: 1, message: messageText };

      zimInstance.sendMessage(messageTextObj, toConversationID, conversationType, config)
        .then(function ({ message }) {
          setMessages(prev => [...prev, message]);
        })
        .catch(function (err) {
          console.log("Fail to send message!", err)
          // Failed to send a message.
        });
    }
    setMessageText("");
  };

  const format_time = (time) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {
        isLoggedIn === false ? <>
          <div className="loginCon w-screen h-screen flex flex-col items-center justify-center">
            <div className="loginForm w-[30vw] h-auto p-[20px] rounded-xl bg-zinc-800 shadow-xl shadow-black/50 flex flex-col items-center">
              <h3 className='font-bold text-[25px]'>Welcome Back</h3>
              <p className='text-[gray] text-[14px]'>Login to continue chatting.</p>

              <p className='font-[700] text-[20px] mt-4'>Select User</p>
              <select onChange={(e) => { setSelectedUser(e.target.value) }} value={selectedUser} className='w-full p-[10px] h-[40px] bg-zinc-700 rounded-lg mt-2'>
                <option value="rohan">Rohan</option>
                <option value="aman">Aman</option>
              </select>
              <button onClick={login} className='w-full p-[10px] bg-white text-black font-[700] rounded-lg mt-3 transition-all hover:bg-white/80'>Login</button>
            </div>
          </div>
        </> : <>
          <div className="chatCon w-screen h-screen flex flex-col items-center justify-center">
            <div className="chatBox w-[80vw] h-[90vh] bg-zinc-900 rounded-xl p-[20px]">
              <div className="top h-[50px]">
                <h3 className='font-[700] text-[20px]'>{userInfo.username}'s chat</h3>
              </div>
              <div className="chats flex flex-col">
                 {
                  messages ? messages.map((msg, index)=> {
                    let isOwnMsg = msg.senderUserID === userInfo.userID;
                    return (
                      <>
                        <div className={`msg min-w-[20vw] shadow-lg ${isOwnMsg?"self-end bg-zinc-800 shadow-black/50" : "self-start bg-blue-500 shadow-blue/50"} max-w-[40vw] bg-zinc-800 rounded-lg p-[10px] my-[10px] flex flex-col items-start`} key={index}>
                          <p>{msg.message}</p>
                          <p className={`text-[14px] ${isOwnMsg?"text-[gray]":"text-white/80"} mt-[5px]`}>{format_time(msg.timestamp)}</p>
                        </div>
                      </>
                    ) 
                  }) : "No Messages Yet!"
                 }
                 <div ref={messageEndRef}></div>
              </div> 
              <div className="bottom flex items-ceneter h-[50px]">
                <input onChange={(e)=>{setMessageText(e.target.value)}} value={messageText} onKeyDown={(e)=>{e.key === "Enter" && sendMessage()}} type="text" placeholder='Enter Your Message Here...' className='w-full p-[10px] bg-zinc-800 rounded-lg'/>
                <button className='p-[10px] bg-white text-black font-[700] rounded-lg ml-2' onClick={sendMessage}>Send</button>
              </div>
            </div>
          </div>
        </>
      }
    </>
  )
}

export default App