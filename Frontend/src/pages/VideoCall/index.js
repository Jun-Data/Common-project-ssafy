import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { OpenVidu } from "openvidu-browser";
import "./style.css";

const VideoChat = () => {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscriber, setSubscriber] = useState(null);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [mode, setMode] = useState("create");

  const navigate = useNavigate();

  const OV = useRef(null);
  const publisherRef = useRef(null);
  const subscriberRef = useRef(null);

  const pathSegments = window.location.pathname.split("/");
  const storeNo = pathSegments[1];
  console.log(storeNo);

  useEffect(() => {
    OV.current = new OpenVidu();

    return () => {
      if (session) {
        session.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const autoJoinSession = async () => {
      if (!storeNo) return;

      try {
        // 세션 존재 여부 확인
        const checkResponse = await fetch(
          `https://i12a506.p.ssafy.io/api/sessions/${storeNo}`,
          { method: "GET" }
        );

        if (checkResponse.ok) {
          // 세션이 존재하면 바로 참가
          setSessionId(storeNo);
          setMode("join");
          await joinSession();
        } else {
          // 세션이 없으면 생성 후 참가
          setMode("create");
          await joinSession();
        }
      } catch (error) {
        console.error("자동 참가 중 오류:", error);
      }
    };

    autoJoinSession();
  }, []);

  // publisher가 변경될 때마다 실행되는 useEffect
  useEffect(() => {
    if (publisher && publisherRef.current) {
      publisher.addVideoElement(publisherRef.current);
    }
  }, [publisher]);

  // subscriber가 변경될 때마다 실행되는 useEffect
  useEffect(() => {
    if (subscriber && subscriberRef.current) {
      subscriber.addVideoElement(subscriberRef.current);
    }
  }, [subscriber]);

  const createSession = async () => {
    try {
      const sessionResponse = await fetch(
        `https://i12a506.p.ssafy.io/api/sessions?storeNo=${
          window.location.pathname.split("/")[1]
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!sessionResponse.ok) {
        throw new Error("세션 생성 실패");
      }

      const newSessionId = await sessionResponse.text();
      setSessionId(newSessionId);
      return newSessionId;
    } catch (error) {
      throw new Error("세션 생성 중 오류 발생: " + error.message);
    }
  };

  const getToken = async (sessionId) => {
    try {
      const tokenResponse = await fetch(
        `https://i12a506.p.ssafy.io/api/sessions/${sessionId}/connections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!tokenResponse.ok) {
        throw new Error("토큰 생성 실패");
      }

      return await tokenResponse.text();
    } catch (error) {
      throw new Error("토큰 생성 중 오류 발생: " + error.message);
    }
  };

  const joinSession = async () => {
    try {
      if (mode === "join" && !sessionId.trim()) {
        throw new Error("세션 ID를 입력해주세요");
      }

      let finalSessionId = sessionId;

      if (mode === "create") {
        finalSessionId = await createSession();
      }

      const token = await getToken(finalSessionId);
      const session = OV.current.initSession();

      session.on("streamCreated", (event) => {
        const subscriber = session.subscribe(event.stream, undefined);
        setSubscriber(subscriber);
      });

      session.on("streamDestroyed", (event) => {
        setSubscriber(null);
      });

      session.on("exception", (exception) => {
        console.warn(exception);
      });

      await session.connect(token);

      const publisher = await OV.current.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
        mirror: false,
      });

      await session.publish(publisher);
      setSession(session);
      setPublisher(publisher);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  const leaveSession = () => {
    if (session) {
      session.disconnect();
      setSession(null);
      setPublisher(null);
      setSubscriber(null);
      setSessionId("");
    }
    navigate(`/storedetail/${storeNo}`);
  };

  return (
    <div className="video-chat">
      {/* {!session && (
        <div className="session-form">
          <div className="mode-selector">
            <button
              className={`mode-button ${mode === "create" ? "active" : ""}`}
              onClick={() => setMode("create")}
            >
              새 세션 만들기
            </button>
            <button
              className={`mode-button ${mode === "join" ? "active" : ""}`}
              onClick={() => setMode("join")}
            >
              기존 세션 참가
            </button>
          </div>

          {mode === "join" && (
            <div className="input-group">
              <input
                type="text"
                placeholder="세션 ID를 입력하세요"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="session-input"
              />
            </div>
          )}

          <button onClick={joinSession} className="join-button">
            {mode === "create" ? "세션 생성 및 참가" : "세션 참가"}
          </button>
        </div>
      )} */}

      {session && (
        <div className="button-container">
          <p className="session-info">현재 가게: {sessionId}</p>
          <button onClick={leaveSession} className="leave-button">
            세션 나가기
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="video-container">
        {publisher && (
          <div className="video-box">
            <video autoPlay ref={publisherRef} className="video-element" />
            <div className="user-label">나</div>
          </div>
        )}

        {subscriber && (
          <div className="video-box">
            <video autoPlay ref={subscriberRef} className="video-element" />
            <div className="user-label">상대방</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoChat;
