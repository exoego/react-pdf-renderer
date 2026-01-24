import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  twoColumns: {
    columnCount: 2,
    columnGap: 20,
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  twoColumnsWide: {
    columnCount: 2,
    columnGap: 40,
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  twoColumnsDefault: {
    columnCount: 2,
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  threeColumns: {
    columnCount: 3,
    columnGap: 15,
    fontSize: 9,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
});

const LOREM_IPSUM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`;

const TextColumns = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Text Column Layout</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Two Columns (columnCount: 2, columnGap: 20)</Text>
        <Text style={styles.twoColumns}>{LOREM_IPSUM}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Two Columns (columnCount: 2, columnGap: 40)</Text>
        <Text style={styles.twoColumnsWide}>{LOREM_IPSUM}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Two Columns Default Gap (columnCount: 2, fontSize: 12, columnGap: auto = 12pt)</Text>
        <Text style={styles.twoColumnsDefault}>{LOREM_IPSUM}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Three Columns (columnCount: 3, columnGap: 15)</Text>
        <Text style={styles.threeColumns}>{LOREM_IPSUM}</Text>
      </View>
    </Page>
  </Document>
);

export default {
  id: 'text-columns',
  name: 'Text Columns',
  description: 'Multi-column text layout using columnCount and columnGap',
  Document: TextColumns,
};
