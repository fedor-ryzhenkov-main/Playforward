import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'store'
import { loadTracksAsync } from 'store/tracks/trackThunks'
import { dbg } from 'utils/debug'
import { TrackList } from 'features/Playforward/components/Library'
import { TrackPlayer } from 'features/Playforward/components/Player'
import { SideMenu } from 'features/Playforward/components/Menu'
import { Flex } from 'design-system/components'

const PlayerComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const activeTrackIds = useSelector((state: RootState) => state.audio.activeTrackIds)
  const tracks = useSelector((state: RootState) => state.tracks.trackList)

  useEffect(() => {
    dbg.store('Player mounted, loading tracks...')
    dispatch(loadTracksAsync())
  }, [dispatch])

  return (
    <Flex className="h-screen">
      <SideMenu />
      
      {/* Track List - increased width from w-80 to w-[32rem] (512px) */}
      <div className="w-[60rem] h-screen overflow-y-auto border-r border-border">
        <TrackList tracks={tracks} />
      </div>

      {/* Active Players - will automatically take remaining space */}
      <div className="flex-1 h-screen overflow-y-auto bg-background-primary">
        <div className="p-4">
          {activeTrackIds.length === 0 ? (
            <div className="text-text-secondary">
              No active players
            </div>
          ) : (
            activeTrackIds.map(trackId => (
              <div key={trackId} className="mb-4 last:mb-0">
                <TrackPlayer trackId={trackId} />
              </div>
            ))
          )}
        </div>
      </div>
    </Flex>
  )
}

export default PlayerComponent