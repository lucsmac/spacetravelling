import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <Link href="/">
      <a>
        <header className={`${commonStyles.container} ${styles.header}`}>
          <img src="/images/spacetraveling.svg" alt="logo" />
        </header>
      </a>
    </Link>
  );
}
