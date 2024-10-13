import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, View, Share } from 'react-native'
import { TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '../constants/theme';
import { Video } from 'expo-av';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import RenderHtml from 'react-native-render-html';
import moment from 'moment';

import { hp, stripHtmlTags, wp } from '../helpers/common';
import Avatar from './Avatar';
import { Comment, Heart, More, ShareIcon } from '../assets/icons/Icons';
import { downloadFile, getSupabaseFileUrl } from '../services/imageServices';
import { createPostLike, removePostLike } from '../services/postServices';
import Loading from './Loading';

const textStyles = {
    fontSize: hp(1.75),
    color: theme.colors.dark
}
const tagsStyles = {
    div: textStyles,
    p: textStyles,
    ol: textStyles,
    h1: {
        color: theme.colors.dark
    },
    h4: {
        color: theme.colors.dark
    }
}

const PostCard = ({
    item,
    currentUser,
    router,
    hasShadow = true,
}) => {
    const shadowStyle = {
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1
    };

    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLikes(item?.postLikes)
    }, [item])


    const openPostDetails = async () => {
        router.push({ pathname: 'postDetails', params: { postId: item?.id } })
    }

    const onLike = async () => {
        if (liked) {
            // remove like
            let updateLikes = likes.filter(like => like.userId != currentUser?.id);

            setLikes(updateLikes);
            let res = await removePostLike(item?.id, currentUser?.id);
            console.log('removed like res', res)
            if (!res.success) {
                Alert.alert('Post', 'Something went wrong')
            }
        } else {
            // add like
            let data = {
                postId: item?.id,
                userId: currentUser?.id
            }
            setLikes([...likes, data]);
            let res = await createPostLike(data);
            console.log('added like res', res)
            if (!res.success) {
                Alert.alert('Post', 'Something went wrong')
            }
        }
    }

    const onShare = async () => {
        try {
            setLoading(true);
            const message = stripHtmlTags(item?.body);

            if (item?.file) {
                const fileUrl = getSupabaseFileUrl(item?.file).uri;
                const localUri = await downloadFile(fileUrl);

                if (localUri) {
                    // Partage de texte et d'image
                    await Sharing.shareAsync(localUri, { dialogTitle: message });
                } else {
                    throw new Error("Impossible de télécharger le fichier");
                }
            } else {
                // Partage de texte seul
                await Share.share({ message: message });
            }
        } catch (error) {
            console.error("Erreur lors du partage :", error);
            Alert.alert("Erreur", "Impossible de partager le contenu");
        } finally {
            setLoading(false);
        }
    };

    const createdAt = moment(item?.created_at).format('MMM D')
    const liked = Array.isArray(likes) && likes.filter(like => like.userId == currentUser?.id)[0] ? true : false;


    return (
        <View style={[styles.container, hasShadow && shadowStyle]}>

            <View style={styles.header}>
                {/* user info and post time */}
                <View style={styles.userInfo}>
                    <Avatar
                        size={hp(4.5)}
                        uri={item?.user?.image}
                        rounded={theme.radius.md}
                    />
                    <View style={{ gap: 2 }}>
                        <Text style={styles.username}>
                            {item?.user?.name}
                        </Text>
                        <Text style={styles.postTime}>
                            {createdAt}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity onPress={openPostDetails}>
                    <More size={hp(3.4)} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* post body & media */}
            <View style={styles.content}>
                <View style={styles.postBody}>
                    {
                        item?.body && (
                            <RenderHtml
                                contentWidth={wp(100)}
                                source={{ html: item?.body }}
                                tagsStyles={tagsStyles}
                            />
                        )
                    }
                </View>

                {/* post image */}
                {
                    item?.file && item?.file?.includes('postImages') && (
                        <Image
                            source={getSupabaseFileUrl(item?.file)}
                            transition={100}
                            style={styles.postMedia}
                            contentFit='cover'
                        />
                    )
                }
                {/* post video */}
                {
                    item?.file && item?.file?.includes('postVideos') && (
                        <Video
                            style={[styles.postMedia, { height: hp(30) }]}
                            source={getSupabaseFileUrl(item?.file)}
                            useNativeControls
                            resizeMode='cover'
                            isLooping
                        />
                    )
                }
            </View>
            {/* like, comment & share */}
            <View style={styles.footer}>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={onLike}>
                        <Heart
                            size={24}
                            name={liked ? 'heart' : 'hearto'}
                            color={liked ? theme.colors.rose : theme.colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.count}>
                        {likes?.length}
                    </Text>
                </View>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={openPostDetails}>
                        <Comment size={24} color={theme.colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.count}>
                        0
                    </Text>
                </View>
                <View style={styles.footerButton}>
                    {
                        loading ? (
                            <Loading size="small" />
                        ) : (
                            <TouchableOpacity onPress={onShare}>
                                <ShareIcon size={24} color={theme.colors.textLight} />
                            </TouchableOpacity>
                        )
                    }

                </View>
            </View>
        </View>

    )
}

export default PostCard

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginBottom: 15,
        borderRadius: theme.radius.xxl * 1.1,
        borderCurve: 'continuous',
        padding: 10,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: theme.colors.gray,
        shadowColor: '#000'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    username: {
        fontSize: hp(1.7),
        color: theme.colors.textDark,
        fontWeight: theme.fonts.medium
    },
    postTime: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium
    },
    content: {
        gap: 10
    },
    postMedia: {
        height: hp(40),
        width: '100%',
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous'
    },
    postBody: {
        marginLeft: 5
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    footerButton: {
        marginLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    count: {
        color: theme.colors.text,
        fontSize: hp(1.8)
    }
})