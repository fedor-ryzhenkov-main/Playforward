import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'store'
import { loadTracksAsync } from 'store/tracks/trackThunks'
import { dbg } from 'utils/debug'
import { openContextMenu } from 'store/contextMenuSlice'
import { TrackList } from 'features/player/components/TrackList'
import { ContextMenu } from 'features/player/components/ContextMenu'
import { TrackPlayer } from 'features/player/components/TrackPlayer'
import { Container, Grid, Header, Text } from 'design-system/components'

const PlayerComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const activeTrackIds = useSelector((state: RootState) => state.audio.activeTrackIds)
  const tracks = useSelector((state: RootState) => state.tracks.trackList)

  useEffect(() => {
    dbg.store('Player mounted, loading tracks...')
    dispatch(loadTracksAsync())
  }, [dispatch])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!(e.target as HTMLElement).closest('[data-track-item]')) {
      dispatch(openContextMenu({ 
        x: e.clientX, 
        y: e.clientY,
        menu: { type: 'default' }
      }))
    }
  }

  return (
    <div 
      className="min-h-screen bg-background-primary"
      onContextMenu={handleContextMenu}
    >
      <Container size="lg" className="py-6">
        <Grid cols={2} gap="lg">
          {/* Left Column - Track List */}
          <div>
            <Header level={2} className="mb-4">
              Available Tracks
            </Header>
            <div className="bg-background-secondary p-4 rounded-md">
              <TrackList tracks={tracks} />
            </div>
          </div>

          {/* Right Column - Active Players */}
          <div>
            <Header level={2} className="mb-4">
              Active Players
            </Header>
            <div className="bg-background-secondary p-4 rounded-md">
              {activeTrackIds.length === 0 ? (
                <Text className="text-text-secondary">
                  No active players
                </Text>
              ) : (
                activeTrackIds.map(trackId => (
                  <div key={trackId} className="mb-4 last:mb-0">
                    <TrackPlayer trackId={trackId} />
                  </div>
                ))
              )}
            </div>
          </div>
        </Grid>
      </Container>
      <ContextMenu />
    </div>
  )
}

export default PlayerComponent