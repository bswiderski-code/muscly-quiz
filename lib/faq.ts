import fs from 'fs';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import { type MDXRemoteSerializeResult } from 'next-mdx-remote';

export interface FaqItem {
    question: string;
    answer: MDXRemoteSerializeResult;
}

export async function getFaqData(locale: string): Promise<FaqItem[]> {
    const contentDir = path.join(process.cwd(), 'content', locale);
    const filePath = path.join(contentDir, 'faq.md');

    if (!fs.existsSync(filePath)) {
        console.warn(`FAQ file not found for locale: ${locale} at ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const items: FaqItem[] = [];
    const sections = content.split('### ').slice(1);

    for (const section of sections) {
        const lines = section.split('\n');
        const question = lines[0].trim();
        const answerMarkdown = lines.slice(1).join('\n').trim();

        const mdxSource = await serialize(answerMarkdown);

        items.push({
            question,
            answer: mdxSource
        });
    }

    return items;
}
