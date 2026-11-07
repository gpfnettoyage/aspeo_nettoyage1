import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-5 text-foreground leading-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mt-8 sm:mt-10 md:mt-12 mb-3 sm:mb-4 md:mb-5 text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base sm:text-lg md:text-xl font-semibold mt-6 sm:mt-7 md:mt-8 mb-2.5 sm:mb-3 text-foreground">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-[13px] sm:text-[15px] text-foreground leading-relaxed">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold">
        {children}
      </strong>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-5 sm:mb-6 space-y-2 sm:space-y-2.5 text-[13px] sm:text-[15px]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-5 sm:mb-6 space-y-2 sm:space-y-2.5 text-[13px] sm:text-[15px]">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-foreground text-[13px] sm:text-[15px]">
        {children}
      </li>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        width={1200}
        height={800}
        className="my-6 sm:my-8 md:my-10 rounded-lg"
        {...(props as ImageProps)}
      />
    ),
    table: ({ children }) => (
      <ScrollArea className="mt-6 sm:mt-8 mb-8 sm:mb-10 md:mb-12 w-full rounded-md border">
        <table className="w-full border-collapse min-w-full">
          {children}
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody>
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-border">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-foreground border-b border-border whitespace-nowrap text-xs sm:text-sm">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-foreground border-b border-border whitespace-nowrap text-xs sm:text-sm">
        {children}
      </td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="relative border-l-4 border-primary/60 pl-4 sm:pl-5 pr-4 py-3 sm:py-4 mt-6 sm:mt-8 md:mt-10 mb-5 sm:mb-6 bg-gradient-to-r from-primary/5 to-transparent rounded-r-md text-[13px] sm:text-[15px] leading-relaxed text-foreground/80 italic font-medium shadow-sm">
        <div className="absolute top-2 left-2 text-primary/20 text-2xl sm:text-3xl leading-none">&ldquo;</div>
        <div className="relative pl-4 sm:pl-5">
          {children}
        </div>
      </blockquote>
    ),
    hr: () => (
      <hr className="my-8 sm:my-10 md:my-12 border-t border-border" />
    ),
    a: ({ href, children }) => {
      // Liens internes (commencent par /)
      if (href?.startsWith('/')) {
        return (
          <Link
            href={href}
            className="text-primary font-medium underline decoration-primary/30 underline-offset-4 transition-all duration-200 hover:decoration-primary hover:text-primary/80"
          >
            {children}
          </Link>
        )
      }
      // Liens externes
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium underline decoration-primary/30 underline-offset-4 transition-all duration-200 hover:decoration-primary hover:text-primary/80"
        >
          {children}
        </a>
      )
    },
    ...components,
  }
}
