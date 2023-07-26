"use client";

import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import PromptBox from "../components/PromptBox";
import Title from "../components/Title";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ResultWithSources from "../components/ResultWithSources";
import ButtonContainer from "../components/ButtonContainer";
import Button from "../components/Button";

const endpoint = "/api/resume-query-metadata";

const ResumeReader = () => {
  const [prompt, setPrompt] = useState("Who has experience with Python?");
  const [error, setError] = useState(null);

  const [messages, setMessages] = useState([
    {
      text: "After loading the vector database, ask me anything about your documents! E.g., Has anyone worked at Meta? Where did Joanna Smith go to school? Does Kaito Esquivel have any recommendations?",
      type: "bot",
    },
  ]);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };
  const handleSubmitUpload = async () => {
    try {
      // Push the response into the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Uploading resumes...",
          type: "bot",
        },
      ]);

      const response = await fetch(`/api/resume-upload`);
      const transcriptRes = await response.json();

      if (!response.ok) {
        throw new Error(transcriptRes.error);
      }

      console.log({ transcriptRes });

      // assuming transcriptRes is an object
      const summariesArray = JSON.parse(transcriptRes.output);

      const newMessages = summariesArray.map((summary) => ({
        text: summary.summary,
        type: "bot",
      }));

      setMessages((prevMessages) => [...prevMessages, ...newMessages]);

      setPrompt("");
    } catch (err) {
      console.error(err);
      setError("Error");
    }
  };

  const handleSubmit = async () => {
    try {
      // Push the user's message into the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      // set loading message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "...", type: "bot", sourceDocuments: null },
      ]);

      const response = await fetch(`${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const searchRes = await response.json();
      console.log({ searchRes });

      // remove loading message
      setMessages((prevMessages) => prevMessages.slice(0, -1));

      // Push the response into the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: searchRes.output,
          type: "bot",
          sourceDocuments: searchRes.sourceDocuments,
        },
      ]);
      setPrompt("");
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  return (
    <>
      <>
        <Title emoji="🤖" headingText="RoboHR" />
        <TwoColumnLayout
          leftChildren={
            <>
              <PageHeader
                heading="Your personal HR assistant"
                boldText="Unleash the power of AI to navigate through a sea of documents."
                description="Introducing a revolutionary tool that employs advanced AI technology to supercharge your HR operations. This solution utilizes Document Loaders to efficiently retrieve and parse a multitude of resumes, employs OpenAI Embeddings to translate complex text into meaningful vector representations, and applies Summarization Chain for crisp, easy-to-digest summaries of each document. Our Pinecone database integration ensures quick and easy access to your data, while our VectorDB QA Chain enables intelligent, context-aware query processing. We've even included Prompt Templates for adaptive and dynamic querying. Finally, with our Vector Store Agent, we ensure a smooth and streamlined user experience. Simply put, our tool provides you with a personal, around-the-clock HR assistant, enabling you to make better, faster, and more informed decisions in your hiring process."
              />

              <ButtonContainer>
                <Button
                  handleSubmit={handleSubmitUpload}
                  endpoint=""
                  buttonText=" Upload Resumes 📂"
                />
                <Button
                  handleSubmit={handleSubmitUpload}
                  endpoint=""
                  buttonText=" Download Sample Resumes 📥"
                />
              </ButtonContainer>
              <p style={{ marginTop: "20px" }}>
                For your convenience, we've already loaded a selection of
                resumes into our Pinecone vector database. If you wish, you're
                more than welcome to click the 'Upload Resumes' button to
                re-upload the pre-set resumes - though, please note, this may
                take some time. Alternatively, you can download our sample
                resumes for comparison. It's important to keep in mind that
                managing a large volume of resumes necessitates a more extensive
                database. Therefore, for the purposes of this demonstration, we
                are only utilizing a set of three pre-configured resumes as
                examples.
              </p>
            </>
          }
          rightChildren={
            <>
              <ResultWithSources messages={messages} pngFile="robohr" />

              <PromptBox
                prompt={prompt}
                handlePromptChange={handlePromptChange}
                handleSubmit={handleSubmit}
                error={error}
                placeHolderText={"Enter Prompt"}
              />
            </>
          }
        />
      </>
    </>
  );
};

export default ResumeReader;
