import { Body, Container, Head, Heading, Html, Link, Preview, Text, Hr } from '@react-email/components'

interface MessageDigestAdminProps {
  t: {
    preview: string
    heading: string
    description: string
    button: string
    footer: string
  }
  orgName: string
  messageCount: string
  messagesHtml: string
  inboxUrl: string
}

export default function MessageDigestAdmin({ t, orgName, messageCount, messagesHtml, inboxUrl }: MessageDigestAdminProps) {
  return (
    <Html>
      <Head />
      <Preview>{t.preview.replace('{{messageCount}}', messageCount)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{t.heading}</Heading>
          <Text style={text}>
            {t.description.replace('{{messageCount}}', messageCount)}
          </Text>
          {/* messagesHtml is pre-sanitized (HTML-escaped) by the digest service */}
          <div style={messagesBox} dangerouslySetInnerHTML={{ __html: messagesHtml }} />
          <Link href={inboxUrl} style={button}>
            {t.button}
          </Link>
          <Hr style={hr} />
          <Text style={footer}>
            {t.footer} — {orgName}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' }
const heading = { fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }
const text = { fontSize: '16px', color: '#4a4a4a', lineHeight: '1.5' }
const messagesBox = { fontSize: '15px', color: '#1a1a1a', padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '6px', lineHeight: '1.5' }
const button = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#6366f1',
  color: '#ffffff',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
  marginTop: '16px',
}
const hr = { borderColor: '#e5e5e5', margin: '24px 0' }
const footer = { fontSize: '14px', color: '#8a8a8a' }
