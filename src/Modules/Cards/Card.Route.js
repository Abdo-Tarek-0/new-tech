// routes/cardRoutes.js
import { Router } from 'express'
import Card from './Cards.Model.js'

const router = Router()

// Save card details
router.post('/save-card', async (req, res) => {
   try {
      const { paymentMethodId, customerId, last4, brand } = req.body
      const card = new Card({
         paymentMethodId,
         customerId,
         last4,
         brand,
      })
      await card.save()
      res.status(200).json({ message: 'Card details saved successfully' })
   } catch (error) {
      console.error(error)
      res.status(500).json({
         message: 'An error occurred while saving the card details',
      })
   }
})

// Get saved card details for a customer
router.get('/:id/saved-cards', async (req, res) => {
   try {
      const { id } = req.params
      const cards = await Card.find({ customerId: id })
      res.status(200).json(cards)
   } catch (error) {
      console.error(error)
      res.status(500).json({
         message: 'An error occurred while retrieving saved card details',
      })
   }
})

export default router
