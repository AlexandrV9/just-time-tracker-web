import { Card, Flex, List, Stack, Text } from "~/shared/ui";

export type TrackingHistoryProps = {};

export type TimeEntry = {
  id: string;
  startAt: Date;
  endAt: Date;
  name: string;
  description?: string;
  tags?: string[];
  showInCalendar: boolean;
};

// TimeEntry
// CalendarEvent

export const TrackingHistory = () => {
  return (
    <Stack.VStack align="start" gap={2}>
      <Text textStyle="2xl" fontWeight="bold">
        Tracking History
      </Text>
      <List.Root listStyleType="none" w="full" gap={3}>
        <List.Item>
          <Card.Root>
            <Card.Body p={4} gap={2}>
              <Flex justifyContent="space-between">
                <Text textStyle="xl" fontWeight="bold">
                  Unnamed Activity
                </Text>
                <Text textStyle="xl" fontWeight="bold">
                  00:03
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color="fg.muted" fontWeight="bold">
                  Saturday, Jan 10
                </Text>
                <Text color="fg.muted" fontWeight="bold">
                  10:58 PM - 10:59 PM
                </Text>
              </Flex>
            </Card.Body>
          </Card.Root>
        </List.Item>

        <List.Item>
          <Card.Root>
            <Card.Body p={4} gap={2}>
              <Flex justifyContent="space-between">
                <Text textStyle="xl" fontWeight="bold">
                  Unnamed Activity
                </Text>
                <Text textStyle="xl" fontWeight="bold">
                  00:03
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color="fg.muted" fontWeight="bold">
                  Saturday, Jan 10
                </Text>
                <Text color="fg.muted" fontWeight="bold">
                  10:58 PM - 10:59 PM
                </Text>
              </Flex>
            </Card.Body>
          </Card.Root>
        </List.Item>

        <List.Item>
          <Card.Root>
            <Card.Body p={4} gap={2}>
              <Flex justifyContent="space-between">
                <Text textStyle="xl" fontWeight="bold">
                  Unnamed Activity
                </Text>
                <Text textStyle="xl" fontWeight="bold">
                  01:03:20
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color="fg.muted" fontWeight="bold">
                  Saturday, Jan 10
                </Text>
                <Text color="fg.muted" fontWeight="bold">
                  10:58 PM - 10:59 PM
                </Text>
              </Flex>
            </Card.Body>
          </Card.Root>
        </List.Item>
      </List.Root>
    </Stack.VStack>
  );
};
