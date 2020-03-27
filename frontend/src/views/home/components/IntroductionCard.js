import React from 'react'
import {
    Card,
    CardContent,
    CardMedia,
    Typography
} from '@material-ui/core'

const IntroductionCard = ({ imageSource, alt, title, description }) => (
    <Card style={{ maxWidth: 390 }}>
        <CardMedia
            component="img"
            alt={ alt }
            title={ alt }
            height="140"
            image={ imageSource }
        />
        <CardContent>
            <Typography gutterBottom variant="h5" component="h3">
                { title }
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
                { description }
            </Typography>
        </CardContent>
    </Card>
)

export default IntroductionCard