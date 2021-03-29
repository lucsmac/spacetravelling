import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${commonStyles.container} ${styles.header}`}>
      <img src="/images/spacetraveling.svg" alt="Spacetravelling" />
    </header>
  );
}
