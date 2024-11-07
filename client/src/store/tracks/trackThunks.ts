import { createAsyncThunk } from '@reduxjs/toolkit';
import { Track } from 'data/models/Track';
import { Repository } from 'data/Repository';
import { setTracks, addTrack, renameTrack, removeTrack, updateDescription, updateTags } from 'store/tracks/trackSlice';
import { dbg } from 'utils/debug';

export const loadTracksAsync = createAsyncThunk(
  'tracks/loadTracks',
  async (_, { dispatch }) => {
    try {
      dbg.store('Loading tracks from repository...');
      const repository = Repository.getInstance();
      const tracks = await repository.getAll();
      const serializedTracks = tracks.map(track => track.serialize());
      
      dispatch(setTracks(serializedTracks));
      dbg.store(`Loaded ${tracks.length} tracks`);
      
      return serializedTracks;
    } catch (error) {
      dbg.store(`Failed to load tracks: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
);

export const uploadTrackAsync = createAsyncThunk(
  'tracks/uploadTrack',
  async ({ 
    file, 
    name, 
    description, 
    tags 
  }: { 
    file: File; 
    name: string; 
    description: string; 
    tags: string[] 
  }, { dispatch }) => {
    try {
      dbg.store(`Starting upload for file: ${file.name}`);
      
      const arrayBuffer = await file.arrayBuffer();
      dbg.store(`Created array buffer of size: ${arrayBuffer.byteLength}`);
      
      const track = Track.create(
        name,
        tags,
        description
      );
      dbg.store(`Created track instance with ID: ${track.id}`);

      const repository = Repository.getInstance();
      dbg.store('Saving track to repository...');
      const savedTrack = await repository.save(track, arrayBuffer);
      dbg.store(`Track saved successfully with ID: ${savedTrack.id}`);
      
      dispatch(addTrack(savedTrack.serialize()));
      dbg.store('Track added to Redux store');
      
      return savedTrack.id;
    } catch (error) {
      if (error instanceof Error) {
        dbg.store(`Upload failed: ${error.message}`);
      } else {
        dbg.store('Upload failed: Unknown error');
      }
      throw error;
    }
  }
);

export const renameTrackAsync = createAsyncThunk(
  'tracks/renameTrack',
  async ({ id, name }: { id: string; name: string }, { dispatch }) => {
    try {
      dbg.store(`Renaming track ${id} to ${name}`);
      const repository = Repository.getInstance();
      const track = await repository.getTrack(id);
      
      if (!track) {
        throw new Error(`Track ${id} not found`);
      }

      await track.updateName(name);
      dispatch(renameTrack({ id, name }));
      
      return { success: true };
    } catch (error) {
      dbg.store(`Failed to rename track: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
);

export const deleteTrackAsync = createAsyncThunk(
  'tracks/deleteTrack',
  async (id: string, { dispatch }) => {
    try {
      dbg.store(`Deleting track ${id}`);
      const repository = Repository.getInstance();
      await repository.delete(id);
      dispatch(removeTrack(id));
      return { success: true };
    } catch (error) {
      dbg.store(`Failed to delete track: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
);

export const updateDescriptionAsync = createAsyncThunk(
  'tracks/updateDescription',
  async ({ id, description }: { id: string; description: string }, { dispatch }) => {
    try {
      dbg.store(`Updating description for track ${id}`);
      const repository = Repository.getInstance();
      const track = await repository.getTrack(id);
      
      if (!track) {
        throw new Error(`Track ${id} not found`);
      }

      await track.updateDescription(description);
      dispatch(updateDescription({ id, description }));
      
      return { success: true };
    } catch (error) {
      dbg.store(`Failed to update description: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
);

export const updateTagsAsync = createAsyncThunk(
  'tracks/updateTags',
  async ({ id, tags }: { id: string; tags: string[] }, { dispatch }) => {
    try {
      dbg.store(`Updating tags for track ${id}`);
      const repository = Repository.getInstance();
      const track = await repository.getTrack(id);
      
      if (!track) {
        throw new Error(`Track ${id} not found`);
      }

      await track.updateTags(tags);
      dispatch(updateTags({ id, tags }));
      
      return { success: true };
    } catch (error) {
      dbg.store(`Failed to update tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
); 