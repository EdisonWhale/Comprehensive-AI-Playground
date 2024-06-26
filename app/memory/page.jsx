"use client";
import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import PromptBox from "../components/PromptBox";
import Title from "../components/Title";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ResultWithSources from "../components/ResultWithSources";
import "../globals.css";

const Memory = () => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm Memory chatbot, designed with Langchain's Buffer Memory and Conversation Chain. You can easily share things like your name and favorite food with me, and then delve into deeper conversations. I'll remember it all!",
      type: "bot",
    },
  ]);
  const [firstMsg, setFirstMsg] = useState(true);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmitPrompt = async () => {
    console.log("sending ", prompt);
    try {
      // Update the user message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      const response = await fetch("/api/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: prompt, firstMsg }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      setPrompt("");
      // don't reinitialize the chain
      setFirstMsg(false);
      const searchRes = await response.json();
      // Add the bot message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: searchRes.output.response, type: "bot", sourceDocuments: null },
      ]);

      console.log({ searchRes });
      // Clear any old error messages
      setError("");
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  return (
    <>
      <Title headingText={"Memory"} emoji="🧠" />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading="I remember everything"
              boldText="Let's see if it can remember your name and favourite food. This tool uses LangChain Buffer Memory and Conversation Chain. "
              description="Conversational memory in chatbots enables them to handle multiple related queries smoothly, providing a consistent conversation. Normally, Large Language Models (LLMs) are stateless and treat each user query separately. However, the incorporation of memory lets them remember prior interactions, which is vital for applications like chatbots."
            />
          </>
        }
        rightChildren={
          <>
            <ResultWithSources messages={messages} pngFile="brain" />
            <PromptBox
              prompt={prompt}
              handleSubmit={handleSubmitPrompt}
              error={error}
              handlePromptChange={handlePromptChange}
            />
          </>
        }
      />
    </>
  );
};

export default Memory;
