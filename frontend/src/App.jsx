import { useState, useMemo } from 'react'
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'

import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from './hooks'

function App() {
  const { data: notes = [], isLoading, isError } = useNotes()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const [formText, setFormText] = useState('')
  const [formColor, setFormColor] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const onCreate = async (e) => {
    e.preventDefault()
    if (!formText) return
    createNote.mutate({ text: formText, color: formColor })
    setFormText('')
    setFormColor('')
  }

  const onEditOpen = (note) => {
    setEditing(note)
    setEditOpen(true)
  }

  const onEditSave = () => {
    if (!editing) return
    updateNote.mutate({ id: editing.uuid, text: editing.text, color: editing.color })
    setEditOpen(false)
    setEditing(null)
  }

  const onDelete = (note) => {
    if (!window.confirm('Delete this note?')) return
    deleteNote.mutate(note.uuid)
  }

  const sorted = useMemo(() => (notes || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [notes])

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ ml: 1 }}>
          Notes
        </Typography>
      </Box>

      <Box component="form" onSubmit={onCreate} sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Text"
          value={formText}
          onChange={(e) => setFormText(e.target.value)}
          fullWidth
        />
        <TextField
          label="Color"
          value={formColor}
          onChange={(e) => setFormColor(e.target.value)}
          sx={{ width: 140 }}
        />
        <Button type="submit" variant="contained" startIcon={<Add />} disabled={createNote.isLoading}>
          Add
        </Button>
      </Box>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Typography color="error">Error loading notes</Typography>}

      <Grid container spacing={2}>
        {sorted.map((note) => (
          <Grid item key={note.uuid} xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: note.color || 'background.paper' }}>
              <CardContent>
                <Typography variant="body1">{note.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(note.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton size="small" onClick={() => onEditOpen(note)} aria-label="edit">
                  <Edit />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(note)} aria-label="delete">
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit note</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 400 }}>
          <TextField
            label="Text"
            value={editing?.text || ''}
            onChange={(e) => setEditing((s) => ({ ...s, text: e.target.value }))}
            multiline
          />
          <TextField
            label="Color"
            value={editing?.color || ''}
            onChange={(e) => setEditing((s) => ({ ...s, color: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={onEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default App
