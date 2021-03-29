import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: React.FC<HomeProps> = ({ postsPagination }) => {
  console.log(postsPagination);

  const formattedPostDate = (date: string): string => {
    const formattedDate = format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
    return formattedDate;
  };

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <ul className={styles.posts}>
          {postsPagination.results.map(post => (
            <li key={post.uid} className={styles.post}>
              <Link href={post.uid}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.infos}>
                    <span>
                      <img src="/images/calendar.png" alt="calendar" />
                      {formattedPostDate(post.first_publication_date)}
                    </span>
                    <span>
                      <img src="/images/author.png" alt="author" />
                      {post.data.author}
                    </span>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>

        {postsPagination.next_page && (
          <span className={styles.loadMore}>Carregar mais posts</span>
        )}
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
      pageSize: 20,
    }
  );

  const posts = postsResponse.results.map(
    (post): Post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }
  );

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};

export default Home;
