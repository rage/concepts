import React, { useState } from 'react'
import { useNotification } from './NotificationProvider'

export const useWarningNotification = ({ message, onClick }) => {
  const { open } = useNotification()
  return ({
    message, onClick
  }) => open({
    title:'Warning',
    message, 
    type:'WARNING', 
    onClick
  })
}