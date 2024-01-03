import { useEffect, useMemo, useState } from "react";
import { Stack, IconButton, Async } from "@fluentui/react";
import DOMPurify from "dompurify";
import React from "react"
import styles from "./Answer.module.css";
import {SpeakerMute24Filled,Speaker224Filled } from "@fluentui/react-icons";
import { AskResponse, getCitationFilePath, updateFeedBack, updateFeedBackRequest } from "../../api";
import { parseAnswerToHtml } from "./AnswerParser";
import { AnswerIcon } from "./AnswerIcon";
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

interface Props {
    answer: AskResponse;
    isSelected?: boolean;
    onCitationClicked: (filePath: string) => void;
    onThoughtProcessClicked: () => void;
    onSupportingContentClicked: () => void;
    onFollowupQuestionClicked?: (question: string) => void;
    showFollowupQuestions?: boolean;
    question: string,
    onRefreshedClicked: (question : string) => void;
}

export const Answer = ({
    answer,
    isSelected,
    onCitationClicked,
    onThoughtProcessClicked,
    onSupportingContentClicked,
    onFollowupQuestionClicked,
    showFollowupQuestions,
    question,
    onRefreshedClicked
}: Props) => {
    const AZUREAPIKEY = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const REGION = import.meta.env.VITE_AZURE_OPENAI_API_REGION;
    const [synth,setSynth]=useState<any>(null)
    const [startspeak,setstartSpeak]=useState<Boolean>(false)
    const parsedAnswer = useMemo(() => parseAnswerToHtml(answer.answer, onCitationClicked), [answer]);

    const sanitizedAnswerHtml = DOMPurify.sanitize(parsedAnswer.answerHtml);
    const [answerStatus, setAnswerStatus] = useState<number>(0);

    const makeUpdateFeedbackApiRequest = async (id: string, feedback: number = 0) => {
        try {
            const request: updateFeedBackRequest = {
                id,
                feedback
            };
            const result = await updateFeedBack(request);
            setAnswerStatus(feedback);
        } catch (e) {

        }
    };
    useEffect(()=>{
      let synth= window.speechSynthesis;
      setSynth(synth)

    //   return ()=>{
    //     setSynth(null)
    //   }
    //   const speechConfig = sdk.SpeechConfig.fromSubscription(AZUREAPIKEY, REGION);
    //   speechConfig.speechRecognitionLanguage = "en-US";
    //   speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

    //   const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    //   const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    //   setSynth(synthesizer)
    },[])

    const speakText = async(e,text:string) => {
        e.preventDefault();
        if (synth) {
        setstartSpeak(true)
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = speechSynthesis.getVoices().filter(function(voice) {
            // return voice.name == "Google UK English Female"
            return voice.name=="Microsoft Zira - English (United States)"

          })[0];
        synth.speak(utterance);
        }

        };

      const stopSpeak=(e)=>{
        e.preventDefault();
        // WINDOWS DEFAULT METHOD
        if(synth){
            synth.cancel();
            setstartSpeak(false)
        }

      }

    return (
        <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
            <Stack.Item>
                <Stack horizontal horizontalAlign="space-between">
                   {answer.dbresponse != undefined ? answer.dbresponse == 0 ? <div>
                        <em data-toggle="tooltip" data-placement="top" title="This response has been generated from AI" style={{ fontSize: '20px', padding: '0px', borderRadius: '5px', color: 'rgb(115, 118, 225)' }} className="darkericons fas fa-robot"></em>
                   </div> : <div>
                        <em data-toggle="tooltip" data-placement="top" title="This response has been generated from database." style={{ fontSize: '16px', padding: '0px', borderRadius: '5px', color: 'rgb(115, 118, 225)', marginRight: '16px' }} className="darkericons fa fa-database"></em>
                    </div>
                   : <AnswerIcon /> }
                    <div>
                    {startspeak==false?<Speaker224Filled onClick={(e)=>speakText(e,sanitizedAnswerHtml)} primaryFill="rgba(115, 118, 225, 1)" className={styles.speaker_container}/>:
                        <SpeakerMute24Filled onClick={stopSpeak} primaryFill="#fa3d37" className={styles.speaker_container} />
                        }
                        {answer.dbresponse == 1 && <em
                            className= {`fa-solid fa-arrows-rotate darkericons ${styles.refreshicon}`}
                            data-toggle="tooltip" data-placement="top" title="This response has been generated from database, click here to fetch response from AI for the same query."
                             onClick={onRefreshedClicked}
                        ></em>}

                        <IconButton
                            style={{ color: "black" }}
                            iconProps={{ iconName: "Lightbulb" }}
                            title="Show thought process"
                            ariaLabel="Show thought process"
                            onClick={() => onThoughtProcessClicked()}
                            disabled={!answer.thoughts}
                        />
                        <IconButton
                            style={{ color: "black" }}
                            iconProps={{ iconName: "ClipboardList" }}
                            title="Show supporting content"
                            ariaLabel="Show supporting content"
                            onClick={() => onSupportingContentClicked()}
                            disabled={!answer.data_points.length}
                        />
                    </div>
                </Stack>
            </Stack.Item>

            <Stack.Item grow>
                <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: sanitizedAnswerHtml }}></div>
            </Stack.Item>

            {!!parsedAnswer.citations.length && (
                <Stack.Item>
                    <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                        <span className={styles.citationLearnMore}>Citations:</span>
                        {parsedAnswer.citations.map((x, i) => {
                            const path = getCitationFilePath(x);
                            return (
                                <a key={i} className={styles.citation} title={x} onClick={() => onCitationClicked(path)}>
                                    {`${++i}. ${x}`}
                                </a>
                            );
                        })}
                    </Stack>

                </Stack.Item>
            )}

            {!!parsedAnswer.followupQuestions.length && showFollowupQuestions && onFollowupQuestionClicked && (
                <Stack.Item>
                    <Stack horizontal wrap className={`${!!parsedAnswer.citations.length ? styles.followupQuestionsList : ""}`} tokens={{ childrenGap: 6 }}>
                        <span className={styles.followupQuestionLearnMore}>Follow-up questions:</span>
                        {parsedAnswer.followupQuestions.map((x, i) => {
                            return (
                                <a key={i} className={styles.followupQuestion} title={x} onClick={() => onFollowupQuestionClicked(x)}>
                                    {`${x}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}
            {answer.dbresponse != undefined && answer.dbresponse == 0 && <div className={styles.feedbackicons}>
                <em
                style={{ width: 'fit-content', paddingRight: '20px'}}
                    className={
                        answerStatus === 1
                        ? "fa fa-thumbs-up thumbStyle text-success"
                        : "fa fa-thumbs-o-up thumbStyle text-success"
                    }
                    onClick={() => {
                        makeUpdateFeedbackApiRequest(answer.uid, 1);
                    }}
                ></em>
                <em
                    style={{ width: 'fit-content', paddingRight: '20px'}}
                    className={
                        answerStatus === -1
                        ? "fa fa-thumbs-down thumbStyle text-danger"
                        : "fa fa-thumbs-o-down thumbStyle text-danger"
                    }
                    onClick={() => {
                        makeUpdateFeedbackApiRequest(answer.uid, -1);
                    }}
                ></em>
            </div>}

        </Stack>
    );
};
