import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import { Hearto, Plus } from '../../assets/icons/Icons'
import { useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postServices'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { supabase } from '../../lib/supabase'
import { getUserData } from '../../services/userServices'
var limit = 0;
const Home = () => {

    const { user, setAuth } = useAuth();
    const router = useRouter();

    const [posts, setPosts] = useState([]);

    const handlePostEvent = async (payload) => {
        if (payload.eventType == 'INSERT' && payload?.new?.id) {
            let newPost = { ...payload.new }
            let res = await getUserData(newPost.userId);
            newPost.user = res.success ? res.data : {};
            setPosts(prevPosts => [newPost, ...prevPosts]);
        }
    }

    useEffect(() => {
        let postChannel = supabase
            .channel('posts')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'posts'
            },
                handlePostEvent)
            .subscribe();
        getPosts();
        return () => {
            supabase.removeChannel(postChannel);
        }
    }, [])

    const getPosts = async () => {
        // call the api here
        limit += 10;

        console.log('limit:', limit)
        let res = await fetchPosts();
        if (res.success) {
            setPosts(res.data);
        }
    }


    // const onLogout = async () => {
    //     const { error } = await supabase.auth.signOut();
    //     if (error) {
    //         Alert.alert('Sign Out', "Error signing out!")
    //     }
    // }
    return (
        <ScreenWrapper bg='white'>
            <View style={styles.container}>
                {/* header */}
                <View style={styles.header}>
                    <Text style={styles.title}>LinkUp</Text>
                    <View style={styles.icons}>
                        <Pressable onPress={() => router.push('notifications')}>
                            <Hearto size={hp(3.2)} color={theme.colors.text} />
                        </Pressable>
                        <Pressable onPress={() => router.push('newPost')}>
                            <Plus size={hp(3.2)} color={theme.colors.text} />
                        </Pressable>
                        <Pressable onPress={() => router.push('profile')}>
                            <Avatar
                                uri={user?.image}
                                size={hp(4.3)}
                                rounded={theme.radius.sm}
                                style={{ borderWidth: 2 }}
                            />
                        </Pressable>
                    </View>
                </View>
                {/* posts list */}
                <FlatList
                    data={posts}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listStyle}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <PostCard
                        item={item}
                        currentUser={user}
                        router={router}
                    />}
                    ListFooterComponent={(
                        <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
                            <Loading />
                        </View>
                    )}
                />
            </View>
            {/* <Button title="logout" onPress={onLogout} /> */}
        </ScreenWrapper>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginHorizontal: wp(4)
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(3.2),
        fontWeight: theme.fonts.bold
    },
    avatarImage: {
        height: hp(4.3),
        width: hp(4.3),
        borderRadius: theme.radius.sm,
        borderCurve: 'continuous',
        borderColor: theme.colors.gray,
        borderWidth: 3
    },
    icons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 18
    },
    listStyle: {
        paddingTop: 20,
        paddingHorizontal: wp(4),
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: 'center',
        color: theme.colors.text,
    },
    pill: {
        position: 'absolute',
        right: -10,
        top: -4,
    }
})
