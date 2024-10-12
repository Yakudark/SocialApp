import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { actions, RichToolbar, RichEditor } from 'react-native-pell-rich-editor'
import { theme } from '../constants/theme'

const RichTextEditor = ({
    editorRef,
    onChange
}) => {
    return (
        <View style={{ minHeight: 285 }}>
            <RichToolbar
                editor={editorRef}
                style={styles.richBar}
                actions={[
                    actions.setStrikethrough,
                    actions.removeFormat,
                    actions.setBold,
                    actions.setItalic,
                    actions.insertOrderedList,
                    actions.blockquote,
                    actions.alignLeft,
                    actions.alignCenter,
                    actions.alignRight,
                    actions.code,
                    actions.line,
                    actions.heading1,
                    actions.heading4,
                ]}
                iconMap={{
                    [actions.heading1]: ({ tintColor }) => <Text style={{ colors: tintColor }}>H1</Text>,
                    [actions.heading4]: ({ tintColor }) => <Text style={{ colors: tintColor }}>H4</Text>,

                }}
                flatContainerStyle={styles.flatStyle}
                selectedIconTint={theme.colors.primaryDark}
                disabled={false}
            />
            <RichEditor
                ref={editorRef}
                style={styles.rich}
                editorStyle={styles.contentStyle}
                placeholder="Write something..."
                onChange={onChange}
            />
        </View>
    )
}

export default RichTextEditor

const styles = StyleSheet.create({
    richBar: {
        backgroundColor: theme.colors.gray,
        borderTopRightRadius: theme.radius.xl,
        borderTopLeftRadius: theme.radius.xl,
    },
    rich: {
        minHeight: 240,
        flex: 1,
        borderWidth: 1.5,
        borderTopWidth: 0,
        borderBottomLeftRadius: theme.radius.xl,
        borderBottomRightRadius: theme.radius.xl,
        borderColor: theme.colors.gray,
        padding: 5,
    },
    contentStyle: {
        color: theme.colors.textDark,
        placeholderColor: 'gray',
    },
    flatStyle: {
        paddingHorizontal: 8,
        gap: 3,
    }
})

