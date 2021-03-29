/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { UtterancesComments } from '../../components/UtterancesComments';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    }[];
  };
}

interface PostProps {
  postBefore: Post;
  post: Post;
  postAfter: Post;
}

export default function Post({
  post,
  postBefore,
  postAfter,
}: PostProps): JSX.Element {
  const formattedPostDate = (date: string): string => {
    const formattedDate = format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
    return formattedDate;
  };

  const formattedPostDateFull = (date: string): string => {
    const formattedDate = format(new Date(date), "dd MMM yyyy, 'às' kk:mm", {
      locale: ptBR,
    });
    return formattedDate;
  };

  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  console.log('last: ', post.last_publication_date);

  return (
    <>
      <Head>
        <title>{post.data.title} | Spacetraveling</title>
      </Head>

      <Header />

      <main className={styles.postContainer}>
        <article className={styles.post}>
          <img
            className={styles.banner}
            src={post.data.banner.url}
            alt={post.data.title}
          />
          <div className={commonStyles.container}>
            <h1>{post.data.title}</h1>
            <div className={commonStyles.infos}>
              <span>
                <img src="/images/calendar.png" alt="calendar" />
                {formattedPostDate(post.first_publication_date)}
              </span>
              <span>
                <img src="/images/author.png" alt="author" />
                {post.data.author}
              </span>
              <span>
                <img src="/images/clock.png" alt="author" /> 4 min
              </span>
            </div>

            {post.last_publication_date && (
              <span className={styles.updatedAt}>
                <i>
                  * editado em{' '}
                  {formattedPostDateFull(post.last_publication_date)}
                </i>
              </span>
            )}

            <div className={styles.content}>
              {post.data.content.map(content => {
                return (
                  <div key={content.heading}>
                    <h2>{content?.heading}</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(content.body),
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </article>
        <div className={`${styles.postsNav} ${commonStyles.container}`}>
          {postBefore && (
            <div className={styles.prevPost}>
              <Link href={`/post/${postBefore.uid}`}>
                <a>
                  <p>{postBefore.data.title}</p>
                  <span>Post anterior</span>
                </a>
              </Link>
            </div>
          )}
          {postAfter && (
            <div className={styles.nextPost}>
              <Link href={`/post/${postAfter.uid}`}>
                <a>
                  <p>{postAfter.data.title}</p>
                  <span>Próximo post</span>
                </a>
              </Link>
            </div>
          )}
        </div>
        <UtterancesComments />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.uid'],
      pageSize: 3,
    }
  );

  return {
    paths: posts.results.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      };
    }),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  console.log(response.last_publication_date);

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body.map(body => {
            return {
              text: body.text,
              type: body.type,
              spans: [...body.spans],
            };
          }),
        };
      }),
    },
  };

  const postsResponseBefore = await prismic.query(
    [
      Prismic.Predicates.dateBefore(
        'document.first_publication_date',
        post.first_publication_date
      ),
    ],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
      pageSize: 2,
    }
  );

  const postBefore = postsResponseBefore.results[0] ?? null;

  const postsResponseAfter = await prismic.query(
    [
      Prismic.Predicates.dateAfter(
        'document.first_publication_date',
        post.first_publication_date
      ),
    ],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
      pageSize: 2,
    }
  );

  const postAfter = postsResponseAfter.results[0] ?? null;

  return {
    props: {
      postBefore,
      post,
      postAfter,
    },
    redirect: 60 * 30,
  };
};
