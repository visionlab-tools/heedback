import { Body, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components'

interface ChangelogPublishedProps {
  t: {
    preview: string
    heading: string
    description: string
    button: string
    footer: string
    unsubscribe: string
  }
  title: string
  excerpt: string
  changelogUrl: string
  unsubscribeUrl: string
  orgName: string
}

export default function ChangelogPublished({
  t,
  title,
  excerpt,
  changelogUrl,
  unsubscribeUrl,
  orgName,
}: ChangelogPublishedProps) {
  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{t.heading}</Heading>
          <Text style={text}>{t.description}</Text>
          <Heading as="h2" style={subheading}>
            {title}
          </Heading>
          <Text style={text}>{excerpt}</Text>
          <Link href={changelogUrl} style={button}>
            {t.button}
          </Link>
          <Text style={footer}>
            {t.footer} — {orgName}
          </Text>
          <Link href={unsubscribeUrl} style={unsubscribeLink}>
            {t.unsubscribe}
          </Link>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' }
const heading = { fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }
const subheading = { fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }
const text = { fontSize: '16px', color: '#4a4a4a', lineHeight: '1.5' }
const button = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#6366f1',
  color: '#ffffff',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
}
const footer = { fontSize: '14px', color: '#8a8a8a', marginTop: '32px' }
const unsubscribeLink = { fontSize: '12px', color: '#8a8a8a' }
