'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

interface FaqItem {
  question: string;
  answer: MDXRemoteSerializeResult;
}

interface FaqAccordionProps {
  faqData: FaqItem[];
}

export default function FaqAccordion({ faqData }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4 w-full">
      {faqData.map((faq, index) => (
        <div 
          key={index}
          className="bg-white rounded-xl border-4 border-black overflow-hidden transition-all duration-200"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-gray-50/50"
          >
            <span className="font-bold text-lg pr-4 text-gray-800" style={{ fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif" }}>
              {faq.question}
            </span>
            <ChevronDown 
              className={`shrink-0 w-5 h-5 text-gray-600 transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div 
              className="px-6 pb-5 pt-2 prose prose-slate max-w-none text-left prose-p:my-0 prose-p:leading-relaxed prose-strong:text-gray-900 text-gray-700"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <MDXRemote {...faq.answer} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
