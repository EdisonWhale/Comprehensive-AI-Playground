"use client";
import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import PromptBox from "../components/PromptBox";
import ResultStreaming from "../components/ResultStreaming";
import Title from "../components/Title";
import TwoColumnLayout from "app/components/TwoColumnLayout";

const Streaming = () => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [data, setData] = useState("");
  const [source, setSource] = useState(null);

  const processToken = (token) => {
    return token.replace(/\\n/g, "\n").replace(/\"/g, "");
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      console.log(`sending ${prompt}`);
      await fetch("/api/streaming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: prompt }),
      });
      // close existing sources
      if (source) {
        source.close();
      }
      // create new eventsource

      const newSource = new EventSource("/api/streaming");

      setSource(newSource);

      newSource.addEventListener("newToken", (event) => {
        const token = processToken(event.data);
        setData((prevData) => prevData + token);
      });

      newSource.addEventListener("end", () => {
        newSource.close();
      });
    } catch (err) {
      console.error(err);
      setError(error);
    }
  };

  // Clean up the EventSource on component unmount
  useEffect(() => {
    // stuff is gonna happen
    return () => {
      if (source) {
        source.close();
      }
    };
  }, [source]);
  return (
    <>
      <Title emoji="💭" headingText="Streaming" />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading="Spit a Rap."
              boldText="No one enjoys the delay of API loading times. Presenting a chatbot that lets you craft a rap song by simply inputting a city and name of your choice. By utilizing streaming, we've significantly enhanced the user experience of this chatbot."
              description="
              Developers often face latency issues while building applications with Large Language Models (LLMs), as multiple API calls can slow the process down, leading to a poor user experience. Streaming can minimize this perceived delay by serving outputs as they're generated, token by token, in real-time. Although it doesn't reduce the total response time, it improves user perception by showing progress instantly, especially in chat applications."
            />
          </>
        }
        rightChildren={
          <>
            <ResultStreaming data={data} />
            <PromptBox
              prompt={prompt}
              handlePromptChange={handlePromptChange}
              handleSubmit={handleSubmit}
              placeHolderText={"Enter your name and city"}
              error={error}
              pngFile="pdf"
            />
          </>
        }
      />
    </>
  );
};

export default Streaming;
