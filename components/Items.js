import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/Home.module.css'
import ItemEl from './ItemEl';
import ItemForm from './ItemForm';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

export default function Items({ session }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState(null)
  const [defaultBalance, setDefaultBalance] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getItems()
    getDefaultBalance()
  }, [session])

  async function getCurrentUser() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    if (!session?.user) {
      throw new Error('User not logged in')
    }

    return session.user
  }

  async function getItems() {
    try {
      setLoading(true)
      const user = await getCurrentUser()

      let { data, error, status } = await supabase
        .from('items')
        .select('name, price, image, priority')
        .eq('user_id', user.id)

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setItems(data)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function getDefaultBalance() {
    try {
      setLoading(true)
      const user = await getCurrentUser()

      let { data, error, status } = await supabase
        .from('balances')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setDefaultBalance(data)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleOpen() {
    setOpen(!open)
  }

  async function handleAdd(formData) {
    const { data, error } = await supabase
    .from('items')
    .insert([formData])

    setOpen(false)
  }

  return (
    <div className={styles.column}>
      <div className={styles.row}>
        <h3>Items</h3>
        {!open ? (
          <IconButton className={styles.button} onClick={handleOpen}>
            <AddIcon />
          </IconButton>
        ) : (
          <IconButton className={styles.button} onClick={handleOpen}>
            <ClearIcon />
          </IconButton>
        )}
      </div>
      {!open ? (
        <div className={styles.grid}>
          {items ? (
            items.map((item) => <ItemEl item={item} />)
          ) : (
            <></>
          )}
        </div>
      ) : (
        <ItemForm onAdd={handleAdd} userId={session.user.id} defaultBalance={defaultBalance} />
      )}
    </div>
  )
}