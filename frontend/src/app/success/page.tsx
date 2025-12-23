"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function SuccessPage() {
  return (
    <div className={styles.page}>
      <main className={styles.shell}>
        <div className={styles.content}>
          <div className={styles.icon}>✓</div>
          <h1 className={styles.title}>Thank you!</h1>
          <p className={styles.message}>
            Your lead has been captured successfully. We will review your submission
            and follow up with you shortly.
          </p>
          <p className={styles.submessage}>
            We typically respond within one business day.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.button}>
              Submit another lead
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

