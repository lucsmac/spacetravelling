import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';

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

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <ul className={styles.posts}>
          <li className={styles.post}>
            <Link href="/">
              <a>
                <h2>Como utilizar Hooks</h2>
                <p>Pensando em sincronização em vez de ciclos de vida.</p>
                <div className={styles.infos}>
                  <span>
                    <img src="/images/calendar.png" alt="calendar" />
                    15 Mar 2021
                  </span>
                  <span>
                    <img src="/images/author.png" alt="author" />
                    Joseph Oliveira
                  </span>
                </div>
              </a>
            </Link>
          </li>
        </ul>
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
