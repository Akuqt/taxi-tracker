import React, { useEffect } from 'react';
import styled from 'styled-components/native';
import { useLocation, useUdpSocket } from '../../hooks';
import { useDispatch, useSelector } from 'react-redux';
import { UserCard, DataCard, Btn } from '../../components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setLocation, Data } from '../../redux/location';
import { RootState } from '../../redux';

const Container = styled.View`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
`;
const ButtonsContainer = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 30px 0px;
`;

type Props = NativeStackScreenProps<
  {
    Profile: undefined;
  },
  'Profile'
>;

export const Location: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.userReducer.user);
  const { watchId } = useSelector(
    (state: RootState) => state.watchReducer.data,
  );

  const { socket } = useUdpSocket();
  const sendUdpData = (
    data: Data,
    address: string = '10.0.2.2',
    port: number = 5000,
  ) => {
    socket.send(
      JSON.stringify({ id: user.id, data }, null, 2),
      undefined,
      undefined,
      port,
      address,
      (err: any) => {
        if (err) console.log(err);
        console.log('sent');
      },
    );
  };

  const {
    getLocation,
    getLocationUpdates,
    removeLocationUpdates,
    states: { location },
  } = useLocation((data: Data) => {
    sendUdpData(data);
    dispatch(setLocation(data));
  }, 1000);

  useEffect(() => {
    socket.bind(12345);
    socket.once('listening', function () {});

    getLocation();

    return () => {
      removeLocationUpdates();
      socket.close();
    };
  }, []);

  return (
    <Container>
      <ButtonsContainer>
        <Btn
          bold
          label="TRACK"
          bg="#FF6347"
          onPress={getLocationUpdates}
          disabled={watchId !== null}
        />
        <Btn
          bold
          label="UNTRACK"
          bg="#acacac"
          onPress={removeLocationUpdates}
          disabled={watchId === null}
        />
      </ButtonsContainer>
      <UserCard
        img={`https://avatars.dicebear.com/api/${user.gender}/${user.name}.svg`}
        name={user.name}
        lastname={user.lastname}
        id={user.id}
        role={user.role}
        onPress={() => {
          navigation.navigate('Profile');
        }}
      />
      <DataCard
        lat={location?.coords.latitude || 0}
        lng={location?.coords.longitude || 0}
        speed={location?.coords.speed || 0}
        tmp={location?.timestamp || 0}
      />
    </Container>
  );
};
