import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// Photo from Unsplash
// https://unsplash.com/photos/snow-mountain-under-stars-phIFdC6lA4E
// Free to use under https://unsplash.com/license
import PHOTO_MOUNTAIN from '../../../public/mountain.jpg';

const CHECKER_PATTERN =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAAMklEQVQ4jWP0mnDzPwMesDVfDZ80AxNeWSLAqAGDwQDG////400H3hNv0dYFowYMBgMAjgYJzbo8Q+sAAAAASUVORK5CYII=';

const CHECKER_TRANSPARENT =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAAK0lEQVQ4jWNkYGCYyYAfpOOTZCKgmSAYNWAwGMBIhBq86WTgvTBqABUMAABjtwG4seNlfQAAAABJRU5ErkJggg==';

const STRIPE_PATTERN =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAAKUlEQVQ4jWN87mPznwEJ8K3cicxl+BTuzoBPnomBQjBqwKgBowYMFgMAjssG/pCHR68AAAAASUVORK5CYII=';

const styles = StyleSheet.create({
  // Page with tiled background pattern
  pageWithBackground: {
    padding: 40,
    backgroundImage: `url(${STRIPE_PATTERN})`,
    backgroundRepeat: 'repeat',
    backgroundSize: '16',
  },

  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    backgroundColor: 'white',
    padding: 10,
  },

  label: {
    fontSize: 11,
    marginBottom: 8,
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 4,
  },

  // Card with photo background and text overlay
  card: {
    width: 280,
    height: 160,
    marginBottom: 30,
    borderRadius: 8,
    backgroundImage: `url(${PHOTO_MOUNTAIN})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: 20,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  cardSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },

  // Hero banner
  hero: {
    width: '100%',
    height: 180,
    marginBottom: 30,
    backgroundImage: `url(${PHOTO_MOUNTAIN})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  heroSubtext: {
    fontSize: 12,
    color: 'white',
    marginTop: 8,
  },

  // Repeat demo boxes
  repeatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 30,
  },
  repeatBox: {
    width: 110,
    height: 80,
    border: '2px solid #333',
    backgroundColor: '#fff',
  },

  contentBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 4,
    border: '1px solid #ddd',
  },

  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333',
    marginBottom: 15,
  },

  // Decorative sidebar with repeat-y
  pageWithSidebar: {
    flexDirection: 'row',
  },
  sidebar: {
    width: 24,
    backgroundImage: `url(${CHECKER_PATTERN})`,
    backgroundRepeat: 'repeat-y',
    backgroundSize: '24',
  },
  mainContent: {
    flex: 1,
    padding: 30,
  },

  // Gradient styles
  gradientBox: {
    width: 150,
    height: 100,
    marginBottom: 15,
    borderRadius: 4,
  },
  gradientContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 30,
  },
});

const BackgroundImageExample = () => (
  <Document>
    <Page size="A4" style={styles.pageWithSidebar}>
      <View style={styles.sidebar} />
      <View style={styles.mainContent}>
        <Text style={styles.title}>Decorative Sidebar</Text>
        <Text style={styles.paragraph}>
          This page uses repeat-y to create a decorative sidebar pattern running
          vertically along the left edge.
        </Text>
        <View style={{ marginTop: 30 }}>
          <View
            style={[
              styles.card,
              {
                backgroundImage:
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              },
            ]}
          >
            <Text style={styles.cardTitle}>Gradient Card</Text>
            <Text style={styles.cardSubtitle}>No image needed</Text>
          </View>
        </View>

        <View
          style={{
            width: '100%',
            height: 150,
            backgroundColor: '#1a1a2e',
            backgroundImage:
              'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.5), transparent 50%)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
            Spotlight Effect
          </Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photo Background</Text>
          </View>
        </View>
      </View>
    </Page>

    <Page size="A4" style={{ padding: 40 }}>
      <Text style={styles.title}>Background Repeat Modes</Text>

      <View style={styles.repeatContainer}>
        <View>
          <Text style={styles.label}>repeat</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${CHECKER_TRANSPARENT})`,
                backgroundRepeat: 'repeat',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>repeat-x</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${CHECKER_TRANSPARENT})`,
                backgroundRepeat: 'repeat-x',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>repeat-y</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${CHECKER_TRANSPARENT})`,
                backgroundRepeat: 'repeat-y',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>no-repeat</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${CHECKER_TRANSPARENT})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.title}>Background Position</Text>

      <View style={styles.repeatContainer}>
        <View>
          <Text style={styles.label}>top left</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${PHOTO_MOUNTAIN})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '150%',
                backgroundPosition: 'top left',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>top right</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${PHOTO_MOUNTAIN})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '150%',
                backgroundPosition: 'top right',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>center</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${PHOTO_MOUNTAIN})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '150%',
                backgroundPosition: 'center',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>bottom right</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${PHOTO_MOUNTAIN})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '150%',
                backgroundPosition: 'bottom right',
              },
            ]}
          />
        </View>
      </View>

      <View style={[styles.repeatContainer, { marginTop: 10 }]}>
        <View>
          <Text style={styles.label}>0% 0%</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${PHOTO_MOUNTAIN})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '200%',
                backgroundPosition: '0% 0%',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>50% 50%</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${PHOTO_MOUNTAIN})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '200%',
                backgroundPosition: '50% 50%',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>100% 100%</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${PHOTO_MOUNTAIN})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '200%',
                backgroundPosition: '100% 100%',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>25% 75%</Text>
          <View
            style={[
              styles.repeatBox,
              {
                backgroundImage: `url(${PHOTO_MOUNTAIN})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '200%',
                backgroundPosition: '25% 75%',
              },
            ]}
          />
        </View>
      </View>
    </Page>

    <Page size="A4" style={{ padding: 40, paddingBottom: 0 }}>
      <Text style={styles.title}>Linear Gradients</Text>

      <View style={styles.gradientContainer}>
        <View>
          <Text style={styles.label}>to bottom (default)</Text>
          <View
            style={[
              styles.gradientBox,
              {
                backgroundImage: 'linear-gradient(black, white)',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>to right</Text>
          <View
            style={[
              styles.gradientBox,
              {
                backgroundImage: 'linear-gradient(to right, #ff6b6b, #feca57)',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>45deg</Text>
          <View
            style={[
              styles.gradientBox,
              {
                backgroundImage: 'linear-gradient(45deg, #5f27cd, #48dbfb)',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>Multi-color</Text>
          <View
            style={[
              styles.gradientBox,
              {
                backgroundImage:
                  'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.title}>Radial Gradients</Text>

      <View style={styles.gradientContainer}>
        <View>
          <Text style={styles.label}>Basic radial</Text>
          <View
            style={[
              styles.gradientBox,
              {
                backgroundImage: 'radial-gradient(circle, white, black)',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>Ellipse (default)</Text>
          <View
            style={[
              styles.gradientBox,
              {
                backgroundImage: 'radial-gradient(#ff9a9e, #fecfef)',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>At corner</Text>
          <View
            style={[
              styles.gradientBox,
              {
                backgroundImage:
                  'radial-gradient(circle at 0% 0%, #667eea, transparent)',
              },
            ]}
          />
        </View>

        <View>
          <Text style={styles.label}>Multi-color</Text>
          <View
            style={[
              styles.gradientBox,
              {
                backgroundImage:
                  'radial-gradient(circle, #f093fb, #f5576c 50%, #4facfe)',
              },
            ]}
          />
        </View>
      </View>
    </Page>

    <Page size="A4" style={{ padding: 40 }}>
      <Text style={styles.title}>Multiple Backgrounds (overlays)</Text>
      <View
        style={{
          width: '100%',
          height: 150,
          marginBottom: 30,
          backgroundImage: `
            radial-gradient(circle, transparent 45%, black 48%),
            radial-gradient(ellipse farthest-corner, #fc1c14 20%, #cf15cf 80%)
          `,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
          Gradient + Pattern overlay
        </Text>
      </View>

      <View
        style={{
          width: 300,
          height: 120,
          marginBottom: 30,
          backgroundImage: `
            linear-gradient(45deg, transparent 45%, rgba(255,0,0,0.5) 50%, transparent 55%),
            linear-gradient(-45deg, transparent 45%, rgba(0,0,255,0.5) 50%, transparent 55%),
            linear-gradient(to right, #f8f9fa, #e9ecef)
          `,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
          Multiple linear gradients
        </Text>
      </View>

      <View
        style={{
          width: 350,
          height: 150,
          marginBottom: 30,
          backgroundImage: `
            linear-gradient(to right, rgba(255,0,0,0.7), rgba(255,255,0,0.7)),
            url(${PHOTO_MOUNTAIN})
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
          Red to Yellow Overlay
        </Text>
      </View>

      <View
        style={{
          width: '100%',
          height: 120,
          marginBottom: 30,
          backgroundImage: `
            url(${CHECKER_TRANSPARENT}),
            linear-gradient(to right, #ff6b6b, #feca57, #48dbfb)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '16',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
          Transparent pattern over gradient
        </Text>
      </View>
    </Page>

    <Page size="A4" style={styles.pageWithBackground}>
      <Text style={styles.title}>Page with Tiled Background</Text>

      <Text style={styles.label}>Hero banner with centered text</Text>
      <View style={styles.hero}>
        <Text style={styles.heroText}>Welcome</Text>
        <Text style={styles.heroSubtext}>Your journey starts here</Text>
      </View>
    </Page>
  </Document>
);

export default {
  id: 'background-image',
  name: 'Background Image',
  description:
    'CSS background-image with repeat, gradients, and multiple layers',
  Document: BackgroundImageExample,
};
