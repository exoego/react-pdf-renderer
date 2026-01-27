import React from 'react';
import { Document, Page, Font, Text, View, StyleSheet } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

Font.register({
  family: 'NotoSansJP',
  src: 'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 5,
    color: '#666',
    fontFamily: 'Helvetica',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  box: {
    width: 80,
    marginRight: 8,
    padding: 5,
    border: '1px solid #ccc',
  },
  boxWide: {
    width: 100,
    marginRight: 8,
    padding: 5,
    border: '1px solid #ccc',
  },
  label: {
    fontSize: 7,
    color: '#999',
    marginBottom: 3,
    fontFamily: 'Helvetica',
  },
  englishText: {
    fontFamily: 'Oswald',
    fontSize: 12,
  },
  japaneseText: {
    fontFamily: 'NotoSansJP',
    fontSize: 12,
  },
  usageText: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    marginBottom: 4,
  },
});

const HyphensControl = () => (
  <Document>
    <Page style={styles.page}>
      {/* English Hyphen Examples */}
      <View style={styles.section}>
        <Text style={styles.title}>1. Hyphen Control (English)</Text>
        <Text style={styles.subtitle}>
          Long word in narrow container - control hyphen character
        </Text>

        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.label}>Default (hyphen)</Text>
            <Text style={styles.englishText}>
              Potentieelbroeikasgasemissierapport
            </Text>
          </View>

          <View style={styles.box}>
            <Text style={styles.label}>hyphens: none</Text>
            <Text style={[styles.englishText, { hyphens: 'none' }]}>
              Potentieelbroeikasgasemissierapport
            </Text>
          </View>

          <View style={styles.box}>
            <Text style={styles.label}>hyphenateCharacter: ...</Text>
            <Text style={[styles.englishText, { hyphenateCharacter: '...' }]}>
              Potentieelbroeikasgasemissierapport
            </Text>
          </View>
        </View>
      </View>

      {/* Japanese without word-break */}
      <View style={styles.section}>
        <Text style={styles.title}>2. Japanese Text - Without word-break</Text>
        <Text style={styles.subtitle}>
          Problem: &quot;い&quot; alone on a line due to script-based run splitting
        </Text>

        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.label}>keep-all (problem)</Text>
            <Text style={[styles.japaneseText, { wordBreak: 'keep-all', hyphens: 'none' }]}>
              本当に長いテキスト
            </Text>
          </View>
        </View>
      </View>

      {/* Japanese with word-break: normal */}
      <View style={styles.section}>
        <Text style={styles.title}>3. Japanese Text - With word-break: normal</Text>
        <Text style={styles.subtitle}>
          Solution: CJK characters break at any position, no hyphens
        </Text>

        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.label}>wordBreak: normal</Text>
            <Text style={[styles.japaneseText, { wordBreak: 'normal', hyphens: 'none' }]}>
              本当に長いテキスト
            </Text>
          </View>

          <View style={styles.boxWide}>
            <Text style={styles.label}>Longer text</Text>
            <Text style={[styles.japaneseText, { wordBreak: 'normal', hyphens: 'none' }]}>
              これは本当に長いテキストです。日本語は自然に折り返されます。
            </Text>
          </View>
        </View>
      </View>

      {/* Mixed content */}
      <View style={styles.section}>
        <Text style={styles.title}>4. Mixed Content (Japanese + English)</Text>
        <Text style={styles.subtitle}>
          CJK breaks anywhere, Latin only at hyphenation points
        </Text>

        <View style={styles.row}>
          <View style={styles.boxWide}>
            <Text style={styles.label}>wordBreak: normal</Text>
            <Text style={[styles.japaneseText, { wordBreak: 'normal', hyphens: 'none' }]}>
              Hello世界！これはテストです。
            </Text>
          </View>

          <View style={styles.boxWide}>
            <Text style={styles.label}>wordBreak: break-all</Text>
            <Text style={[styles.japaneseText, { wordBreak: 'break-all', hyphens: 'none' }]}>
              Hello世界！これはテストです。
            </Text>
          </View>
        </View>
      </View>

      {/* URL example */}
      <View style={styles.section}>
        <Text style={styles.title}>5. Long URLs</Text>
        <Text style={styles.subtitle}>
          break-all allows URLs to wrap at any character
        </Text>

        <View style={styles.row}>
          <View style={styles.boxWide}>
            <Text style={styles.label}>normal (overflow)</Text>
            <Text style={[styles.englishText, { wordBreak: 'normal', fontSize: 8 }]}>
              https://example.com/very/long/path/to/resource
            </Text>
          </View>

          <View style={styles.boxWide}>
            <Text style={styles.label}>break-all (wraps)</Text>
            <Text style={[styles.englishText, { wordBreak: 'break-all', hyphens: 'none', fontSize: 8 }]}>
              https://example.com/very/long/path/to/resource
            </Text>
          </View>
        </View>
      </View>

      {/* Usage Reference */}
      <View style={styles.section}>
        <Text style={styles.title}>CSS Properties Reference</Text>
        <Text style={styles.usageText}>
          hyphens: none | manual | auto - Control hyphen insertion
        </Text>
        <Text style={styles.usageText}>
          hyphenateCharacter: string - Custom character (empty = no hyphen)
        </Text>
        <Text style={styles.usageText}>
          wordBreak: normal | break-all | keep-all - Control line break behavior
        </Text>
        <Text style={[styles.usageText, { marginTop: 5, color: '#666' }]}>
          Tip: For Japanese, use wordBreak: normal (default). CJK automatically
          breaks at any character without hyphens.
        </Text>
      </View>
    </Page>
  </Document>
);

export default {
  id: 'hyphens-control',
  name: 'Hyphens Control',
  description: 'Demonstrates hyphens, hyphenateCharacter, and wordBreak CSS properties',
  Document: HyphensControl,
};
