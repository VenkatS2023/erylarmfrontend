import React, { useEffect, useState } from "react";
import { Stack, TextField } from "@fluentui/react";
import { Send28Filled } from "@fluentui/react-icons";
import styles from "./QuestionInput.module.css";
import { Audioconvert } from "../Audioconverter/index";

interface Props {
  onSend: (question: string) => void;
  disabled: boolean;
  placeholder?: string;
  clearOnSend?: boolean;
  userquestion?: string;
}

export const QuestionInput = ({
  onSend,
  disabled,
  placeholder,
  clearOnSend,
  userquestion,
}: Props) => {
  const [question, setQuestion] = useState<string>("");
  const [audio, setaudio] = useState<Boolean>(false);
  useEffect(() => {
    if (userquestion) {
      setQuestion(userquestion);
    }
  }, [userquestion]);
  const sendQuestion = () => {
    console.log(question, "question in question inout");
    if (disabled || !question.trim()) {
      return;
    }
    onSend(question);

    if (clearOnSend) {
      setQuestion("");
    }
  };

  const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      sendQuestion();
    }
  };

  const onQuestionChange = (
    _ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    if (!newValue) {
      setQuestion("");
    } else if (newValue.length <= 1000) {
      setQuestion(newValue);
    }
  };

  const sendQuestionDisabled = disabled || !question.trim();

  return (
    <Stack horizontal className={styles.questionInputContainer}>
      <TextField
        className={styles.questionInputTextArea}
        placeholder={audio ? "I'm listening..." : placeholder}
        multiline
        resizable={false}
        borderless
        value={question}
        onChange={onQuestionChange}
        onKeyDown={onEnterPress}
      />
      <div className={styles.questionInputButtonsContainer}>
        <Audioconvert
          setQuestion={setQuestion}
          onSend={onSend}
          setaudio={setaudio}
          audio={audio}
        />
        <div
          className={`${styles.questionInputSendButton} ${
            sendQuestionDisabled ? styles.questionInputSendButtonDisabled : ""
          }`}
          aria-label="Ask question button"
          onClick={sendQuestion}
        >
          <Send28Filled primaryFill="rgba(115, 118, 225, 1)" />
        </div>
      </div>
    </Stack>
  );
};
