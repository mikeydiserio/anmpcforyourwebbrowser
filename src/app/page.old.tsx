'use client'
import SampleCard from '@/components/SampleCard/SampleCard'
import SampleDetail from '@/components/SampleDetail'
import { useSampleContext } from '@/context/SampleContext'
import styled from '@emotion/styled'
import { useEffect } from 'react'
import { Sample } from '../types'

const Grid = styled.div`
  font-family: 'Questrial';
  border-radius: var(--border-radius);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-column-gap: 18px;
  grid-row-gap: 89px;
`

const HomePage = () => {
  const { samples, setSamples, selectedSample, selectSample } = useSampleContext();

  useEffect(() => {
    async function fetchSamples() {
      try {
        const res = await fetch("/api/samples");
        if (!res.ok) {
          console.error("Failed to fetch samples");
          return;
        }
        const data = await res.json();
        setSamples(data.samples);
      } catch (error) {
        console.error("Error fetching samples:", error);
      }
    }
    fetchSamples();
  }, []);

  return (
    <div>
			{selectedSample && <SampleDetail />}
      <h2 id="collection">The collection</h2>
			<p>Click on a sample to see more details</p>
      <Grid>
        {samples?.map((sample: Sample) => (
          <SampleCard key={sample.title} sample={sample} />
        ))}
      </Grid>
    </div>
  )
}

export default HomePage;
