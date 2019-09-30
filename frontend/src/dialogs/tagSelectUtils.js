import chroma from 'chroma-js'

const colors = ['purple', 'blue', 'darkturquoise', 'green', 'orange', 'maroon']

String.prototype.hashCode = function() {
  let hash = 0
  for (let i = 0; i < this.length; i++)
    hash = (((hash << 5) - hash) + this.charCodeAt(i)) | 0
  return hash
}

export const backendToSelect = tags => tags ? tags.map(tag => ({
  value: tag.name,
  label: tag.name,
  type: tag.type,
  color: colors[((tag.name.hashCode() % colors.length) + colors.length) % colors.length]
})) : []

export const selectToBackend = tags => tags?.map(tag => ({
  type: tag.type,
  name: tag.value
})) || []

export const tagSelectStyles = {
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    if (!data?.color) {
      return styles
    }
    const color = chroma(data.color)
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
          ? data.color
          : isFocused
            ? color.alpha(0.1).css()
            : null,
      color: isDisabled
        ? '#ccc'
        : isSelected
          ? chroma.contrast(color, 'white') > 2
            ? 'white'
            : 'black'
          : data.color,
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css())
      }
    }
  },
  multiValue: (styles, { data }) => {
    if (!data?.color) {
      return styles
    }
    const color = chroma(data.color)
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css()
    }
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ':hover': {
      backgroundColor: data.color,
      color: 'white'
    }
  })
}

export const onTagCreate = tag => ({
  label: tag,
  value: tag,
  name: tag,
  type: 'custom'
})

const tagSelectProps = defaults => ({
  type: 'select',
  isMultiSelect: true,
  styles: tagSelectStyles,
  onSelectCreate: onTagCreate,
  valueMutator: selectToBackend,
  defaultValue: defaults ? backendToSelect(defaults) : []
})

export default tagSelectProps
