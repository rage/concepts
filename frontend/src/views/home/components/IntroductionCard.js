import React from 'react'
import {
    Card,
    CardContent,
    CardMedia,
    Typography
} from '@material-ui/core'

const IntroductionCard = ({ imageSource, alt, title, description }) => (
    <Card style={{ maxWidth: 345, whiteSpace: 'nowrap' }}>
        <CardContent>
            <CardMedia
                component="img"
                alt={ alt }
                title={ alt }
                height="140"
                image={ imageSource }
            />
            <Typography>
                { title }
            </Typography>
            <Typography variant="body2" noWrap="true" color="textSecondary" component="p">
                { description }
            </Typography>
        </CardContent>
    </Card>
)

export default IntroductionCard