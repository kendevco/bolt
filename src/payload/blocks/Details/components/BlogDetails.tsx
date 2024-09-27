'use client'

import { Blog } from '@payload-types'
import { payloadSlateToHtmlConfig, slateToHtml } from '@slate-serializers/html'
import { format } from 'date-fns'
import DOMPurify from 'isomorphic-dompurify'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ShareList from '../../common/ShareList'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/Avatar'
import { getInitials } from '@/utils/getInitials'

interface BlogDetailsProps {
  blog: Blog
}

const readTime = (content: string) => {
  const contentLength = content.toString().split('').length
  const time = Math.ceil(contentLength / 200)

  return time
}

const BlogDetails: React.FC<BlogDetailsProps> = ({ blog }) => {
  const router = useRouter()

  const html = slateToHtml(blog?.content || [], {
    ...payloadSlateToHtmlConfig,
    markMap: {
      ...payloadSlateToHtmlConfig.markMap,
      mark: ['mark'],
    },
  })
  const purifiedHtml = DOMPurify.sanitize(html, {
    ADD_ATTR: ['target'], // Allow the "target" attribute
    ADD_TAGS: ['iframe'], // You can also add other tags if needed (optional)
  })

  const imageURL =
    typeof blog?.blogImage !== 'string'
      ? { url: blog?.blogImage?.url!, alt: blog?.blogImage?.alt }
      : { url: '', alt: '' }

  const tags = blog.tags
    ? blog.tags.map(({ value }) => {
        if (typeof value !== 'string') {
          return {
            title: value.title,
            color: value.color || 'purple',
          }
        }
      })
    : []

  const userDetails = blog.author
    ? blog.author.map(({ value }) => {
        if (typeof value !== 'string') {
          const { displayName, username, imageUrl } = value

          const url =
            imageUrl && typeof imageUrl !== 'string'
              ? {
                  src: imageUrl.sizes?.thumbnail?.url!,
                  alt: `${imageURL?.alt}`,
                }
              : undefined

          return {
            name: displayName || username,
            url,
          }
        }

        return null
      })
    : []

  return (
    <section className='grid gap-16 lg:grid-cols-[auto_1fr]'>
      <article className='prose-headings:font prose prose-purple dark:prose-invert lg:prose-xl prose-headings:font-semibold prose-a:text-primary prose-a:after:content-["↗"] hover:prose-a:text-primary/90 prose-blockquote:border-primary prose-blockquote:bg-primary/10 prose-blockquote:py-4 prose-img:rounded prose-img:bg-secondary dark:prose-pre:bg-primary/10'>
        <span
          className='not-prose cursor-pointer text-sm text-secondary'
          onClick={() => router.back()}>
          {'<-'} Go Back
        </span>

        <div className='not-prose mb-4 mt-6 flex gap-1'>
          {tags
            .filter(value => Boolean(value))
            .map((details, index) => {
              if (!details) {
                return null
              }

              return (
                <span
                  className={`text-sm font-bold uppercase ${details.color}-tag`}
                  key={index}>
                  {details.title}
                </span>
              )
            })}
        </div>

        <h1 className='not-prose mb-4 text-3xl font-semibold lg:text-5xl lg:leading-[3.5rem]'>
          {blog.title}
        </h1>

        {/* author details */}
        <div className='not-prose mb-5 flex items-center gap-2 lg:hidden'>
          {userDetails
            .filter(details => Boolean(details))
            .map(user => {
              if (!user) {
                return null
              }

              const initials = getInitials(user.name || '')

              return (
                <Avatar key={user.name}>
                  <AvatarImage src={user.url?.src} />
                  <AvatarFallback className='text-sm'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )
            })}
        </div>

        {/* blog published, read-time details */}
        <div className='not-prose flex w-full justify-between text-sm'>
          <span className='flex items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-clock-2'>
              <circle cx='12' cy='12' r='10' />
              <polyline points='12 6 12 12 16 10' />
            </svg>
            {`${readTime(html)} min read`}
          </span>

          <time>{format(blog.createdAt, 'LLL d, yyyy')}</time>
        </div>

        <div className='not-prose relative mb-16 mt-8 aspect-square max-h-[37.5rem] w-full overflow-hidden rounded'>
          <Image
            src={imageURL.url}
            alt={imageURL.alt || `${blog.title} cover pic`}
            fill
            className='h-full w-full object-cover animate-image-blur bg-secondary'
          />
        </div>

        <div dangerouslySetInnerHTML={{ __html: purifiedHtml }} />

        <div className='not-prose mt-8 flex items-center justify-end gap-6 lg:hidden'>
          <p className='text-secondary'>Share: </p>

          <ShareList url={window.location.href} />
        </div>
      </article>

      <div className='sticky top-24 mt-56 hidden h-10 space-y-10 lg:block'>
        <div>
          <p className='mb-4 text-xs text-secondary'>POSTED BY</p>

          {userDetails
            .filter(details => Boolean(details))
            .map(user => {
              if (!user) {
                return null
              }

              const initials = getInitials(user.name || '')

              return (
                <div key={user.name} className='mb-4 flex items-center gap-3'>
                  <Avatar>
                    <AvatarImage src={user.url?.src} />
                    <AvatarFallback className='text-sm'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <p>{user.name}</p>
                </div>
              )
            })}
        </div>

        <div className='flex items-center justify-between'>
          <p className='text-secondary'>Share: </p>

          <ShareList url={window.location.href} />
        </div>
      </div>
    </section>
  )
}

export default BlogDetails
