"use client";

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';
import VoiceChat from '../components/VoiceChat';

import { useEffect } from 'react';





export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);




  // Function to send message via voice or text
  const handleSendMessage = (text: string) => {
    sendMessage({ text });

    // Speak bot response after it's added
    // We'll observe messages and speak latest bot message in useEffect
  };

    // inside Chat component
useEffect(() => {
  if (!messages.length) return;

  const last = messages[messages.length - 1];
  if (last.role !== "assistant") return;

  // Clear any pending speech
  if (speakTimeoutRef.current) {
    clearTimeout(speakTimeoutRef.current);
  }

  // Debounce: wait for streaming to settle
  speakTimeoutRef.current = setTimeout(() => {
    const text = last.parts
      .filter(p => p.type === "text")
      .map(p => p.text)
      .join(" ")
      .trim();

    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.05;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }, 1000); // 👈 1s delay = natural
}, [messages]);




  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <VoiceChat onSendMessage={handleSendMessage} />

      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap mb-4">
          {message.role === 'user' ?(
              <span className='text-3xl'>💁‍♂️</span>
          ):(<span className='text-3xl'>🤖</span>)}

          {message.parts.map((part, i) => {
            if (part.type === 'text') return <div key={`${message.id}-${i}`}>{part.text}</div>;
            return null;
          })}
        </div>
      ))}

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage(input);
          setInput('');
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}



// 'use client';

// import { useChat } from '@ai-sdk/react';
// import { useState } from 'react';

// type AIInput = {
//   query: string;
// }

// type AIOutput = {
//   rows: string[];
// }

// export default function Chat() {
//   const [input, setInput] = useState('');
//   const { messages, sendMessage } = useChat();
//   return (
//     <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
//       {messages.map(message => (
//         <div key={message.id} className="whitespace-pre-wrap mb-4">
//           {message.role === 'user' ?(
//               <span className='text-3xl'>💁‍♂️</span>
//           ):(
//               <span className='text-3xl'>🤖</span>
//           )}
//           {message.parts.map((part, i) => {
//             switch (part.type) {
//               case 'text':
//                 return <div key={`${message.id}-${i}`}>{part.text}</div>;

//               case 'tool-db':
//                 return (
//                   <div
//                   key={`${message.id}-${i}`}
//                   className="my-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border
//                   border-blue-200 dark:border-blue-800">

//                     <div className='font-semibold text-blue-700 dark:text-blue-300 mb-1'>
//                       🔍Database Query
//                     </div>
//                     {(part.input as unknown as AIInput)?.query &&(
//                       <pre className='text-xs bg-white dark:bg-zinc-900 p-2 rounded mb-2 overflow-x-auto'>
//                         {(part.input as unknown as AIInput).query}
//                       </pre>
//                     )}
//                     {part.state === 'output-available' && (part.output as unknown as AIOutput) && (
//                       <div className='text-sm text-green-700 dark:text-green-300'>
//                         Returned {(part.output as unknown as AIOutput).rows?.length || 0} rows
//                       </div>
//                     )}

//                   </div>
//                 );

//               case 'tool-schema':
//                 return (
//                   <div
//                     key={`${message.id}-${i}`}
//                     className='my-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded border
//                     border-purple-200 dark:border-purple-800'
//                   >

//                     <div className='font-semibold text-purple-700 dark:text-purple-300'>
//                       📋Scheam Tool
//                     </div>
//                     {part.state === 'output-available' && (
//                       <div className='text-sm text-green-700 dark:text-green-300 py-2'>
//                         ✅Schema loaded
//                       </div>
//                     )}

//                   </div>
//                 )
//               case 'step-start':
//                 return (
//                   <div
//                     key={`${message.id}-${i}`}
//                     className='text-sm text-gray-500 dark:text-gray-400 my-4'
//                   >🔄️ Processing...</div>
//                 )

//               default:
//                 return null;
//             }
//           })}
//         </div>
//       ))}

//       <form
//         onSubmit={e => {
//           e.preventDefault();
//           sendMessage({ text: input });
//           setInput('');
//         }}
//       >
//         <input
//           className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
//           value={input}
//           placeholder="Say something..."
//           onChange={e => setInput(e.currentTarget.value)}
//         />
//       </form>
//     </div>
//   );
// }